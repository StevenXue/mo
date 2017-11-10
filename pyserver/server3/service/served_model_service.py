# -*- coding: UTF-8 -*-
import os
import psutil
import subprocess

from mongoengine import DoesNotExist
# from kubernetes import client
# from kubernetes import config as kube_config
import port_for

from server3.business import user_business
from server3.business import ownership_business
from server3.business import served_model_business
from server3.service import staging_data_service
from server3.business import staging_data_set_business
from server3.business import job_business
from server3.business import project_business
from server3.service import ownership_service
from server3.service import model_service
from server3.service import kube_service
from server3.utility import network_utility
from server3.entity.model import MODEL_TYPE
from server3.constants import SERVING_PORT
from server3.constants import NAMESPACE
from server3.service.saved_model_services import general_model_services
from server3.utility import json_utility
from datetime import datetime

ModelType = {list(v)[1]: list(v)[0] for v in list(MODEL_TYPE)}


def update_db(served_model_id, name, description, input_info, output_info,
              examples):
    """

    :param served_model_id:
    :param name:
    :param description:
    :param input_info:
    :param output_info:
    :param examples:
    :return:
    """
    update = {'name': name, 'description': description,
              'input_info': input_info, 'output_info': output_info,
              'examples': examples, }
    served_model_business.update_info(served_model_id, update)


def first_save_to_db(user_ID, name, description, input_info, output_info,
                     examples, version,
                     deploy_name, server,
                     input_type, model_base_path, job,
                     job_id, model_name, related_fields,
                     related_tasks, tags, is_private, data_fields,
                     input_data_demo_string,
                     service_name=None,
                     **optional):
    """

    :param user_ID:
    :param name:
    :param description:
    :param input_info:
    :param output_info:
    :param examples:
    :param version:
    :param deploy_name:
    :param server:
    :param input_type:
    :param model_base_path:
    :param job:
    :param job_id:
    :param is_private:
    :param service_name:
    :param model_name:
    :param optional:
    :return:
    """
    user = user_business.get_by_user_ID(user_ID)

    served_model = served_model_business.add(name, description, input_info,
                                             output_info,
                                             examples, version, deploy_name,
                                             server, input_type,
                                             model_base_path, job,
                                             service_name, model_name,
                                             related_fields,
                                             related_tasks,
                                             tags, is_private, data_fields,
                                             input_data_demo_string,
                                             create_time=datetime.utcnow(),
                                             user=user,
                                             **optional)

    ownership_business.add(user, is_private, served_model=served_model)
    job_business.update_job_by_id(job_id, served_model=served_model)
    return served_model


def first_deploy(user_ID, job_id, name, description, input_info, output_info,
                 examples, server, input_type, model_name, projectId,
                 is_private,
                 **optional):
    """
    :param user_ID:
    :param job_id:
    :param name:
    :param description:
    :param input_info:
    :param output_info:
    :param examples:
    :param server:
    :param input_type:
    :param model_name:
    :param is_private:
    :param optional:
    :return:
    """
    job = job_business.get_by_job_id(job_id)
    job_info = job.to_mongo()
    project = project_business.get_by_id(projectId)
    related_fields = project.related_fields
    related_tasks = project.related_tasks
    tags = project.tags

    # if not deployed do the deployment
    try:
        served_model_business.get_by_job(job)
    except DoesNotExist:
        model_type = job.model.category
        if model_type == ModelType['neural_network'] \
                or model_type == ModelType['unstructured']:
            export_path, version = model_service.export(job_id, user_ID)
        else:
            result_sds = staging_data_set_business.get_by_job_id(job_id)
            saved_model_path_array = result_sds.saved_model_path.split('/')
            version = saved_model_path_array.pop()
            export_path = '/'.join(saved_model_path_array)

        cwd = os.getcwd()
        deploy_name = job_id + '-serving'
        service_name = "my-" + job_id + "-service"
        port = port_for.select_random(ports=set(range(30000, 32767)))
        export_path = "/home/root/work/user_directory" + \
                      export_path.split("/user_directory", 1)[1]
        # export_path = "/home/root/work/user_directory" + export_path.split("/user_directory", 1)[1]
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
                            "app": job_id
                        }
                    },
                    "spec": {
                        "containers": [
                            {
                                "name": job_id,
                                "image": "10.52.14.192/gzyw/serving_app",
                                "imagePullPolicy": "IfNotPresent",
                                "ports": [{
                                    "containerPort": 9000,
                                }],
                                "stdin": True,
                                "command": ['tensorflow_model_server'],
                                "args": ['--enable_batching',
                                         '--port={port}'.format(
                                             port=SERVING_PORT),
                                         '--model_name={name}'.format(
                                             name=model_name),
                                         '--model_base_path={export_path}'.format(
                                             export_path=export_path)],
                                "volumeMounts": [
                                    {
                                        "mountPath": "/home/root/work/user_directory",
                                        "name": "nfsvol"
                                    },
                                ]
                            }
                        ],
                        "volumes": [
                            {
                                "name": "nfsvol",
                                "persistentVolumeClaim": {
                                    "claimName": "nfs-pvc"
                                }
                            },
                        ]
                    },
                },
            }
        }
        service_json = {
            "kind": "Service",
            "apiVersion": "v1",
            "metadata": {
                "name": service_name
            },
            "spec": {
                "type": "NodePort",
                "ports": [
                    {
                        "port": 9000,
                        "nodePort": port
                    }
                ],
                "selector": {
                    "app": job_id
                }
            }
        }
        # import json
        # from server3.utility import file_utils
        # file_utils.write_to_filepath(json.dumps(kube_json), './jupyter_app.json')
        # return
        api = kube_service.deployment_api
        s_api = kube_service.service_api
        resp = api.create_namespaced_deployment(body=kube_json,
                                                namespace=NAMESPACE)
        s_api.create_namespaced_service(body=service_json, namespace=NAMESPACE)
        # tf_model_server = './tensorflow_serving/model_servers/tensorflow_model_server'
        # p = subprocess.Popen([
        #     tf_model_server,
        #     '--enable_batching',
        #     '--port={port}'.format(port=SERVING_PORT),
        #     '--model_name={name}'.format(name=name),
        #     '--model_base_path={export_path}'.format(export_path=export_path)
        # ], start_new_session=True)
        # add a served model entity
        server = server.replace('9000', str(port))

        data_fields = job_info['params']['fit']['data_fields']

        job_info['staging_data_set'] = job['staging_data_set'][
            'name'] if job['staging_data_set'] else None
        job_info['staging_data_set_id'] = job['staging_data_set'][
            'id'] if job['staging_data_set'] else None

        staging_data_demo = staging_data_service.get_first_one_by_staging_data_set_id(
            job_info['staging_data_set_id'])
        one_input_data_demo = []
        for each_feture in job_info['params']['fit']['data_fields'][0]:
            one_input_data_demo.append(staging_data_demo[each_feture])
        input_data_demo_string = '[' + ",".join(
            str(x) for x in one_input_data_demo) + ']'
        input_data_demo_string = '[' + input_data_demo_string + ',' + input_data_demo_string + ']'

        return first_save_to_db(user_ID, name, description, input_info,
                                output_info,
                                examples, version,
                                deploy_name, server,
                                input_type, export_path, job,
                                job_id, model_name,
                                related_fields,
                                related_tasks, tags, is_private, data_fields,
                                input_data_demo_string,
                                service_name=service_name,
                                **optional)


def remove_by_id(served_model_id):
    # delete
    served_model = served_model_business.get_by_id(served_model_id)
    try:
        kube_service.delete_deployment(served_model.name)
        kube_service.delete_service(served_model.service_name)
    # served_model_business.terminate_by_id(served_model_id)
    except:
        pass
    served_model_business.remove_by_id(served_model_id)


def undeploy_by_id(served_model_id):
    """
    :param served_model_id:
    :return:
    """
    served_model = served_model_business.get_by_id(served_model_id)
    kube_service.delete_deployment(served_model.deploy_name)
    kube_service.delete_service(served_model.service_name)
    return True


def resume_by_id(served_model_id, user_ID, model_name):
    """

    :param served_model_id:
    :param user_ID:
    :param model_name:
    :return:
    """
    served_model = served_model_business.get_by_id(served_model_id)
    job_id = served_model.jobID
    job = job_business.get_by_job_id(job_id)

    # if not deployed do the deployment
    try:
        served_model_business.get_by_job(job)

        model_type = job.model.category
        if model_type == ModelType['neural_network'] \
                or model_type == ModelType['unstructured']:
            export_path, version = model_service.export(job_id, user_ID)
        else:
            result_sds = staging_data_set_business.get_by_job_id(job_id)
            saved_model_path_array = result_sds.saved_model_path.split('/')
            version = saved_model_path_array.pop()
            export_path = '/'.join(saved_model_path_array)

        cwd = os.getcwd()
        deploy_name = job_id + '-serving'
        service_name = "my-" + job_id + "-service"
        port = port_for.select_random(ports=set(range(30000, 32767)))
        # export_path = "/home/root/work/user_directory" + \
        #               export_path.split("/user_directory", 1)[1]
        export_path = "/home/root/work/user_directory" + \
                      export_path.split("/user_directory", 1)[1]

        # print('resume path', export_path)
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
                            "app": job_id
                        }
                    },
                    "spec": {
                        "containers": [
                            {
                                "name": job_id,
                                "image": "10.52.14.192/gzyw/serving_app",
                                "imagePullPolicy": "IfNotPresent",
                                "ports": [{
                                    "containerPort": 9000,
                                }],
                                "stdin": True,
                                "command": ['tensorflow_model_server'],
                                "args": ['--enable_batching',
                                         '--port={port}'.format(
                                             port=SERVING_PORT),
                                         '--model_name={name}'.format(
                                             name=model_name),
                                         '--model_base_path={export_path}'.format(
                                             export_path=export_path)],
                                "volumeMounts": [
                                    {
                                        "mountPath": "/home/root/work/user_directory",
                                        "name": "nfsvol"
                                    },
                                ]
                            }
                        ],
                        "volumes": [
                            {
                                "name": "nfsvol",
                                "persistentVolumeClaim": {
                                    "claimName": "nfs-pvc"
                                }
                            },
                        ]
                    },
                },
            }
        }
        service_json = {
            "kind": "Service",
            "apiVersion": "v1",
            "metadata": {
                "name": service_name
            },
            "spec": {
                "type": "NodePort",
                "ports": [
                    {
                        "port": 9000,
                        "nodePort": port
                    }
                ],
                "selector": {
                    "app": job_id
                }
            }
        }
        api = kube_service.deployment_api
        s_api = kube_service.service_api
        resp = api.create_namespaced_deployment(body=kube_json,
                                                namespace=NAMESPACE)
        s_api.create_namespaced_service(body=service_json, namespace=NAMESPACE)
        # 更新数据库中的port
        new_server = '10.52.14.182:' + str(port)
        update = {'server': new_server}
        served_model_business.update_info(served_model_id, update)
        return new_server
    except DoesNotExist:
        return False


def get_prediction_by_id(server, model_name, input_value, features):
    return general_model_services.get_prediction_by_id(server, model_name,
                                                       input_value, features)


def list_served_models_by_user_ID(user_ID, order=-1):
    """

    :param user_ID:
    :param order:
    :return:
    """
    if not user_ID:
        raise ValueError('no user id')
    public_sm = ownership_service.get_all_public_objects('served_model')
    owned_sm = ownership_service. \
        get_privacy_ownership_objects_by_user_ID(user_ID, 'served_model')
    # set status
    public_sm = [kube_service.get_deployment_status(sm) for sm in public_sm]
    owned_sm = [kube_service.get_deployment_status(sm) for sm in owned_sm]
    if order == -1:
        public_sm.reverse()
        owned_sm.reverse()
    return public_sm, owned_sm


def list_all_served_models(related_fields=None, related_tasks=None, tags=None,
                           privacy=None, skipping=None, search_str=None):
    """

    :param related_fields:
    :param related_tasks:
    :param tags:
    :param privacy:
    :param skipping:
    :param search_str:
    :return:
    """
    privacy = False
    public_all = served_model_business.get_by_four_querys(
        related_fields=related_fields,
        related_tasks=related_tasks,
        tags=tags, skipping=skipping,
        privacy=privacy,
        search_str=search_str)
    # public_all = [each_model.to_mongo() for each_model in public_all]
    print(public_all)
    public_all = json_utility.me_obj_list_to_json_list(
        public_all)
    print(public_all)
    # myyy = [a['_id'] for a in public_all]
    # print(myyy)
    # print(public_all)
    return public_all


def get_by_model_id(model_ID):
    """

    :param category:
    :return:
    """

    model = served_model_business.get_by_id(model_ID)
    # public_all = [each_model.to_mongo() for each_model in public_all]
    model = json_utility.me_obj_list_to_json_list(
        [model])
    print(model)
    model[0] = build_how_to_use_code(model[0])
    return model


def build_how_to_use_code(model):
    served_model_id = str(model['_id'])
    server = str(model['server'])
    served_model_name = model['model_name']
    print(model['data_fields'])
    features = model['data_fields'][0]
    features_str = '[' + ",".join(
        ('\'' + str(x) + '\'') for x in features) + ']'

    str_js = "let url = 'http://localhost:5000/served_model/predict/" + \
             served_model_id + "';\n"
    str_js += "let data = {\n"
    str_js += "  input_value: "
    str_js += model["input_data_demo_string"] + ",\n"
    str_js += "  served_model_id:\"" + served_model_id + "\",\n"
    str_js += "  server:\"" + server + "\",\n"
    str_js += "  model_name: \"" + served_model_name + "\",\n"
    str_js += "  features: " + features_str + ",\n"
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
    str_py += "  \"input_value\": " + model["input_data_demo_string"] + ",\n"
    str_py += "  \"served_model_id\":\"" + served_model_id + "\",\n"
    str_py += "  \"model_name\":\"" + served_model_name + "\",\n"
    str_py += "  \"features\":" + features_str + ",\n"
    str_py += " }\n"
    str_py += "r = requests.post(\"http://localhost:5000/served_model/predict/" + \
              served_model_id + "\",json=data) \n"
    str_py += "result = r.json()['response']['result']\n"
    str_py += "print(result)\n"
    model['how_to_use_code'] = {}
    model['how_to_use_code']['js'] = str_js
    model['how_to_use_code']['py'] = str_py
    return model
