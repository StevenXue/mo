# -*- coding: UTF-8 -*-
from datetime import datetime
from copy import deepcopy
import shutil
import os

from mongoengine import DoesNotExist
from kubernetes import client
from kubernetes import config as kube_config
import port_for

from server3.service import job_service
from server3.business import project_business
from server3.business import job_business
from server3.business import user_business
from server3.business import ownership_business
from server3.business import result_business
from server3.business import data_set_business
from server3.service import ownership_service
from server3.service import staging_data_service
from server3.service import kube_service
from server3.business import staging_data_set_business
from server3.business import staging_data_business
from server3.business import served_model_business
from server3.utility import json_utility
from server3.repository import config
from server3.constants import USER_DIR
from server3.utility import network_utility
from server3.constants import NAMESPACE
from server3.constants import KUBE_NAME

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')


# NAMESPACE = 'default'


def get_by_id(project_id):
    project = project_business.get_by_id(project_id)
    ow = ownership_business.get_ownership_by_owned_item(project, 'project')
    project.is_private = ow.private
    return project


def create_project(name, description, user_ID, is_private=True,
                   related_fields=[], tags=[], related_tasks=[]):
    """
    Create a new project

    :param name: str
    :param description: str
    :param user_ID: ObjectId
    :param is_private: boolean
    :return: a new created project object
    """

    # create a new project object
    created_project = project_business.add(name, description, related_fields,
                                           tags, related_tasks)
    if created_project:
        project_path = os.path.join(USER_DIR, user_ID, name)
        if not os.path.exists(project_path):
            os.makedirs(project_path)
        # get user object
        user = user_business.get_by_user_ID(user_ID)

        # create ownership relation
        if ownership_business.add(user, is_private, project=created_project):
            return created_project
        else:
            raise RuntimeError('Cannot create ownership of the new project')
    else:
        raise RuntimeError('Cannot create the new project')


def update_project(project_id, name, description, is_private=True,
                   related_fields=[], tags=[], related_tasks=[]):
    """
    Create a new project

    :param name: str
    :param description: str
    :param user_ID: ObjectId
    :param is_private: boolean
    :return: a new created project object
    """
    project = project_business.get_by_id(project_id)
    ow = ownership_business.get_ownership_by_owned_item(project, 'project')
    ownership_business.update_by_id(ow['id'], private=is_private)
    project_business.update_by_id(project_id, name=name,
                                  description=description,
                                  update_time=datetime.utcnow(),
                                  related_fields=related_fields,
                                  tags=tags, related_tasks=related_tasks)



def list_projects_by_user_ID(user_ID, order=-1, privacy='all'):
    """
    list all projects
    :param user_ID:
    :param order:
    :param privacy:
    :return:
    """
    if not user_ID:
        projects = ownership_service.get_all_public_objects('project')
    else:
        if privacy == 'all':
            projects = ownership_service. \
                get_ownership_objects_by_user_ID(user_ID, 'project')
        elif privacy == 'private':
            projects = ownership_service. \
                get_privacy_ownership_objects_by_user_ID(user_ID, 'project')
        elif privacy == 'public':
            projects = ownership_service. \
                get_privacy_ownership_objects_by_user_ID(user_ID, 'project',
                                                         private=False)
        else:
            projects = []

    if order == -1:
        projects.reverse()
    return projects


def remove_project_by_id(project_id, user_ID):
    """
    remove project by its object_id
    :param project_id: object_id of project to remove
    :return:
    """
    project = project_business.get_by_id(project_id)
    # check ownership
    ownership = ownership_business.get_ownership_by_owned_item(project,
                                                               'project')
    if user_ID != ownership.user.user_ID:
        raise ValueError('project not belong to this user, cannot delete')
    # try:
    #     for job in project['jobs']:
    #         job_business.remove_by_id(job['id'])
    #     for result in project['results']:
    #         result_business.remove_by_id(result['id'])
    # except TypeError:
    #     pass
    # delete project directory
    project_directory = UPLOAD_FOLDER + user_ID + '/' + project.name
    if os.path.isdir(project_directory):
        shutil.rmtree(project_directory)
    # delete project object
    return project_business.remove_by_id(project_id)


# 增加result_obj和job_obj到project
def add_job_and_result_to_project(result_obj, project_id):
    """
    add job and result to project
    :param result_obj:
    :param project_id:
    :return:
    """
    job_obj = job_service.get_job_from_result(result_obj)
    return project_business.add_and_update_one_by_id(project_id, result_obj,
                                                     job_obj)


def get_all_jobs_of_project(project_id, categories, status=None):
    """
    get all jobs and job info of a project
    :param project_id:
    :param categories:
    :param status:
    :return:
    """
    jobs = project_business.get_by_id(project_id)['jobs']
    history_jobs = {c: [] for c in categories}
    for job in jobs:
        # keys = history_jobs.keys()
        for key in categories:
            if status is None:
                check = job[key]
            else:
                check = job[key] and (job['status'] == status)
            if check:
                job_info = job.to_mongo()
                # model/toolkit info
                # job_info[key] = {
                #     'item_id': job[key]['id'],
                #     'name': job[key]['name'],
                #     'category': job[key]['category'],
                #     'parameter_spec': job[key]['parameter_spec'],
                #     'steps': job[key]['steps']
                # }
                job_info[key] = job[key].to_mongo()

                # source staging data set info
                job_info['staging_data_set'] = job['staging_data_set'][
                    'name'] if job['staging_data_set'] else None
                job_info['staging_data_set_id'] = job['staging_data_set'][
                    'id'] if job['staging_data_set'] else None

                # result sds info
                # object 用的是 .id  json用 _id
                try:
                    result_sds = staging_data_set_business.get_by_job_id(
                        job['id']).to_mongo()

                    if result_sds:
                        if key == 'model':
                            # model results
                            job_info['results'] = result_sds
                            # FIXME too slow to get metrics status
                            # 已添加索引
                            metrics_status = [sd.to_mongo() for sd in
                                              staging_data_business.get_by_staging_data_set_id(
                                                  result_sds['_id'])]
                            metrics_status.sort(key=lambda x: x['n'])
                            job_info['metrics_status'] = metrics_status
                        else:
                            # toolkit results
                            job_info['results'] = result_sds[
                                'result'] if result_sds and "result" in result_sds else None
                        job_info['results_staging_data_set_id'] = result_sds[
                            '_id'] if result_sds else None
                except DoesNotExist:
                    result_sds = None

                if job['status'] == 200:
                    temp_data_fields = job_info['params']['fit']['data_fields']
                    if not isinstance(temp_data_fields[0], list):
                        job_info['params']['fit']['data_fields'] = [temp_data_fields]
                    print(job_info['params']['fit']['data_fields'][0])
                # model running status info
                # if key == 'model':
                #     job_name = KUBE_NAME['model'].format(job_id=job['id'])
                #     job_info = kube_service.get_job_status(job_info, job_name)

                # 获取 served_model 数据库中的信息
                served_model_id = job_info.get('served_model')
                if served_model_id:
                    served_model = served_model_business.get_by_id(
                        served_model_id)
                    # 获取 kube 中部署模型的状态
                    served_model = kube_service.get_deployment_status(served_model)
                    served_model = served_model.to_mongo()

                    # 获取训练 served_model 时所用的数据的第一条
                    staging_data_demo= staging_data_service.get_first_one_by_staging_data_set_id(job_info['staging_data_set_id'])
                    one_input_data_demo = []
                    for each_feture in job_info['params']['fit']['data_fields'][0]:
                        one_input_data_demo.append(staging_data_demo[each_feture])
                    input_data_demo_string = '['+",".join(str(x) for x in one_input_data_demo)+']'
                    input_data_demo_string = '['+input_data_demo_string+','+input_data_demo_string+']'
                    print(input_data_demo_string)
                    # 生成use代码
                    job_info["served_model"] = served_model
                    job_info["served_model"]["input_data_demo_string"]=input_data_demo_string
                    job_info = build_how_to_use_code(job_info)
                else:
                    served_model = None
                    job_info["served_model"] = served_model

                history_jobs[key].append(job_info)
                break
    return history_jobs


def build_how_to_use_code(job_info):

    served_model_id = str(job_info['served_model']['_id'])
    server = str(job_info['served_model']['server'])
    served_model_name = job_info['served_model']['model_name']
    features = job_info['params']['fit']['data_fields'][0]
    features_str = '[' + ",".join(('\'' + str(x) + '\'') for x in features) +']'

    str_js = "let url = 'http://localhost:5000/served_model/predict/" + \
             served_model_id+"';\n"
    str_js += "let data = {\n"
    str_js += "  input_value: "
    str_js += job_info["served_model"]["input_data_demo_string"]+",\n"
    str_js += "  served_model_id:\"" + served_model_id+"\",\n"
    str_js += "  server:\"" + server + "\",\n"
    str_js += "  model_name: \""+served_model_name+"\",\n"
    str_js += "  features: "+features_str+",\n"
    str_js += "};\n"
    str_js += "fetch(url, {\n"
    str_js += "  method: \"POST\",\n"
    str_js += "  body: JSON.stringify(data),\n"
    str_js += "  headers: {\n"
    str_js += "     \"Content-Type\": \"application/json\",\n"
    str_js += "  },\n"
    str_js += "}).then(function (response) {\n"
    str_js += "  return response.json();\n"
    str_js += "}).then(function (responseData) {\n"
    str_js += "  console.log(responseData);\n"
    str_js += "}).catch(function () {\n"
    str_js += "  console.log('error');\n"
    str_js += "});"

    str_py = "import requests\n"
    str_py += "import json\n"
    str_py += "data = { \n"
    str_py += "  \"server\":\"" + server + "\",\n"
    str_py += "  \"input_value\": " + job_info["served_model"]["input_data_demo_string"] + ",\n"
    str_py += "  \"served_model_id\":\"" + served_model_id + "\",\n"
    str_py += "  \"model_name\":\"" + served_model_name + "\",\n"
    str_py += "  \"features\":" + features_str + ",\n"
    str_py += " }\n"
    str_py += "r = requests.post(\"http://localhost:5000/served_model/predict/"+ \
              served_model_id + "\",json=data) \n"
    str_py += "result = r.json()['response']['result']\n"
    str_py += "print(result)\n"
    job_info['how_to_use_code'] = {}
    job_info['how_to_use_code']['js'] = str_js
    job_info['how_to_use_code']['py'] = str_py
    return job_info

def publish_project(project_id):
    project = project_business.get_by_id(project_id)
    ow = ownership_business.get_ownership_by_owned_item(project, 'project')
    return ownership_business.update_by_id(ow['id'], private=False)


def unpublish_project(project_id):
    project = project_business.get_by_id(project_id)
    ow = ownership_business.get_ownership_by_owned_item(project, 'project')
    return ownership_business.update_by_id(ow['id'], private=True)


def fork(project_id, new_user_ID):
    """
    fork project
    :param project_id:
    :param new_user_ID:
    :return:
    """
    # get project
    project = project_business.get_by_id(project_id)

    # get ownership, and check privacy
    ownership = ownership_business.get_ownership_by_owned_item(
        project, 'project')
    if ownership.private is True:
        raise NameError('forked project is private, fork failed')
    if ownership.user.user_ID == new_user_ID:
        raise NameError('you are forking your self project')
    # get user object
    user = user_business.get_by_user_ID(new_user_ID)
    # copy and save project
    project_cp = project_business.copy(project)
    # create ownership relation
    ownership_business.add(user, True, project=project_cp)

    # copy staging data sets
    sds_array = staging_data_set_business.get_by_project_id(project_id, False)
    for sds in sds_array:
        staging_data_service.copy_staging_data_set(sds, project_cp)

    # copy jobs and save
    jobs = project.jobs
    jobs_cp = []
    for job in jobs:
        # get source sds
        if hasattr(job, 'staging_data_set') and job.staging_data_set:
            sds_cp = staging_data_set_business.get_by_name_and_project(
                job.staging_data_set.name,
                job.staging_data_set.project
            )
            # sds_cp = staging_data_service.copy_staging_data_set(
            #     job.staging_data_set, project_cp)
        else:
            sds_cp = None
        # copy job
        job_cp = job_business.copy_job(job, project_cp, sds_cp)
        if not job_cp:
            continue
        jobs_cp.append(job_cp)
        # copy result staging data set by job and bind to project
        try:
            # get result sds
            result_sds = staging_data_set_business.get_by_job_id(job['id'])
            # bind job to sds
            staging_data_set_business.update_job_by_name_and_project(
                result_sds.name, result_sds.project, job_cp)
            # staging_data_service.copy_staging_data_set(result_sds, project_cp,
            #                                            belonged_job=job_cp)
        except DoesNotExist:
            pass

    project_business.update_by_id(
        project_cp['id'],
        jobs=jobs_cp)
    project_cp.reload()
    return project_cp


def start_project_playground(project_id):
    # generate the project volume path
    project = project_business.get_by_id(project_id)
    user_ID = ownership_business.get_owner(project, 'project').user_ID
    volume_dir = os.path.join(USER_DIR, user_ID, project.name, 'volume/')
    if not os.path.exists(volume_dir):
        os.makedirs(volume_dir)
    abs_volume_dir = os.path.abspath(volume_dir)

    deploy_name = project_id + '-jupyter'
    port = port_for.select_random(ports=set(range(30000, 32767)))
    # port = network_utility.get_free_port_with_range(30000, 32767)
    kube_json = {
        "apiVersion": "apps/v1beta1",
        "kind": "Deployment",
        "metadata": {
            "name": deploy_name
        },
        "spec": {
            "template": {
                "metadata": {
                    "labels": {
                        "app": project_id
                    }
                },
                "spec": {
                    # "securityContext": {
                    #     "runAsUser": 1001,
                    # },
                    "containers": [
                        {
                            "name": project_id,
                            "image": "10.52.14.192/gzyw/jupyter_app",
                            "imagePullPolicy": "IfNotPresent",
                            "ports": [{
                                "containerPort": 8888,
                                # "hostPort": port
                            }],
                            "stdin": True,
                            "command": ['python'],
                            "args": ["-m", "notebook", "--no-browser",
                                     "--allow-root",
                                     "--ip=0.0.0.0",
                                     "--NotebookApp.allow_origin=*",
                                     "--NotebookApp.disable_check_xsrf=True",
                                     "--NotebookApp.token=''",
                                     "--NotebookApp.iopub_data_rate_limit=10000000000"],
                            "volumeMounts": [{
                                "mountPath": "/home/root/work/volume",
                                "name": project_id + "-volume"
                            }]
                        }
                    ],
                    "volumes": [{
                        "name": project_id + "-volume",
                        "hostPath": {"path": abs_volume_dir},
                    }]
                },
            },
        }
    }
    service_json = {
        "kind": "Service",
        "apiVersion": "v1",
        "metadata": {
            "name": "my-" + project_id + "-service"
        },
        "spec": {
            "type": "NodePort",
            "ports": [
                {
                    "port": 8888,
                    "nodePort": port
                }
            ],
            "selector": {
                "app": project_id
            }
        }
    }
    # import json
    # from server3.utility import file_utils
    # file_utils.write_to_filepath(json.dumps(kube_json), './jupyter_app.json')
    # return
    api = kube_service.deployment_api
    s_api = kube_service.service_api
    api.create_namespaced_deployment(body=kube_json,
                                     namespace=NAMESPACE)
    replicas = api.read_namespaced_deployment_status(
        deploy_name, NAMESPACE).status.available_replicas
    # wait until deployment is available
    while replicas is None or replicas < 1:
        replicas = api.read_namespaced_deployment_status(
            deploy_name, NAMESPACE).status.available_replicas
    # FIXME one second sleep to wait for container ready
    import time
    time.sleep(1)
    s_api.create_namespaced_service(body=service_json, namespace=NAMESPACE)
    time.sleep(1)
    return port


def get_playground(project_id):
    service_name = "my-" + project_id + "-service"
    api = kube_service.service_api
    dep = api.read_namespaced_service(service_name, NAMESPACE)
    return dep.spec.ports[0].node_port
