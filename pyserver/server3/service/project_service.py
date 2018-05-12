# -*- coding: UTF-8 -*-
from datetime import datetime
from copy import deepcopy
import shutil
import os
import requests
from urllib.parse import quote

from mongoengine import DoesNotExist
from kubernetes import client
from kubernetes import config as kube_config
import port_for
from flask_jwt_extended import get_raw_jwt

from server3.service import job_service
from server3.business import project_business
from server3.business.project_business import ProjectBusiness
from server3.business.app_business import AppBusiness
from server3.business.module_business import ModuleBusiness
from server3.business.data_set_business import DatasetBusiness
from server3.business import job_business
from server3.business.user_business import UserBusiness
from server3.business import ownership_business
from server3.service import ownership_service
from server3.service import logger_service
from server3.service import staging_data_service
from server3.service import kube_service
from server3.business import staging_data_set_business
from server3.business import staging_data_business
from server3.business import served_model_business
from server3.business.request_answer_business import RequestAnswerBusiness
from server3.service.message_service import MessageService
from server3.business import world_business
from server3.entity.world import CHANNEL

from server3.utility import json_utility
from server3.repository import config
from server3.constants import USER_DIR
from server3.utility import network_utility
from server3.constants import NAMESPACE
from server3.constants import KUBE_NAME
from server3.constants import HUB_SERVER
from server3.constants import ADMIN_TOKEN

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')


# TYPE_MAPPER = {
#     'project': ProjectBusiness,
#     'app': AppBusiness,
#     'module': ModuleBusiness,
#     'dataset': DatasetBusiness,
# }


class TypeMapper:
    project = ProjectBusiness
    app = AppBusiness
    module = ModuleBusiness
    dataset = DatasetBusiness

    @classmethod
    def get(cls, attr='project'):
        return getattr(cls, attr)


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
            user = UserBusiness.get_by_user_ID(user_ID)
            projects = ownership_service. \
                get_ownership_objects_by_user_ID(user, 'project')
        elif privacy == 'private':
            projects = ownership_service. \
                get_privacy_ownership_objects_by_user_ID(user_ID, 'project',
                                                         private=True)
        elif privacy == 'public':
            projects = ownership_service. \
                get_privacy_ownership_objects_by_user_ID(user_ID, 'project',
                                                         private=False)
        else:
            projects = []

    if order == -1:
        projects.reverse()
    return projects


def list_projects(search_query=None, page_no=1, page_size=10,
                  default_max_score=0.4, privacy=None, type='project',
                  user_ID=None, tags=None):
    user = None
    if user_ID:
        user = UserBusiness.get_by_user_ID(user_ID)
    cls = TypeMapper.get(type)
    return cls.get_objects(
        search_query=search_query,
        privacy=privacy,
        page_no=page_no,
        page_size=page_size,
        default_max_score=default_max_score,
        user=user,
        tags=tags
    )


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
    from server3.business import job_business

    # jobs = project_business.get_by_id(project_id)['jobs']

    jobs = job_business.get_by_project(project_id).order_by('-create_time')

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
                if key == 'model':
                    try:
                        result_sds = staging_data_set_business.get_by_job_id(
                            job['id']).to_mongo()
                        if result_sds:
                            # model results
                            job_info['results'] = result_sds
                            metrics_status = [sd.to_mongo() for sd in
                                              staging_data_business.get_by_staging_data_set_id(
                                                  result_sds['_id']).order_by(
                                                  'n')]
                            # metrics_status.sort(key=lambda x: x['n'])
                            job_info['metrics_status'] = metrics_status
                            if len(metrics_status) > 0:
                                total_steps = get_total_steps(job)
                                job_info['percent'] = \
                                    metrics_status[-1]['n'] / total_steps * 100
                            if job_info['status'] == 200:
                                job_info['percent'] = 100
                            job_info['results_staging_data_set_id'] = \
                                result_sds[
                                    '_id'] if result_sds else None
                    except DoesNotExist:
                        result_sds = None
                if job['status'] == 200 and key == 'model':
                    temp_data_fields = job_info['params']['fit']['data_fields']
                    if not isinstance(temp_data_fields[0], list):
                        job_info['params']['fit']['data_fields'] = [
                            temp_data_fields]
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
                    served_model = kube_service.get_deployment_status(
                        served_model)
                    served_model = served_model.to_mongo()

                    # 获取训练 served_model 时所用的数据的第一条
                    staging_data_demo = staging_data_service.get_first_one_by_staging_data_set_id(
                        job_info['staging_data_set_id'])
                    one_input_data_demo = []
                    for each_feture in \
                            job_info['params']['fit']['data_fields'][0]:
                        one_input_data_demo.append(
                            staging_data_demo[each_feture])
                    input_data_demo_string = '[' + ",".join(
                        str(x) for x in one_input_data_demo) + ']'
                    input_data_demo_string = '[' + input_data_demo_string + ',' + input_data_demo_string + ']'
                    print(input_data_demo_string)
                    # 生成use代码
                    job_info["served_model"] = served_model
                    job_info["served_model"][
                        "input_data_demo_string"] = input_data_demo_string
                    job_info = build_how_to_use_code(job_info)
                else:
                    served_model = None
                    job_info["served_model"] = served_model
                history_jobs[key].append(job_info)
                break
    return history_jobs


def get_total_steps(job):
    try:
        total_steps = \
            job['run_args']['conf']['fit']['args'][
                'steps']
    except KeyError:
        total_steps = None
    if not total_steps:
        try:
            total_steps = \
                job['run_args']['conf']['fit'][
                    'args'][
                    'epochs']
        except KeyError:
            total_steps = 1
    return total_steps


def build_how_to_use_code(job_info):
    served_model_id = str(job_info['served_model']['_id'])
    server = str(job_info['served_model']['server'])
    served_model_name = job_info['served_model']['model_name']
    features = job_info['params']['fit']['data_fields'][0]
    features_str = '[' + ",".join(
        ('\'' + str(x) + '\'') for x in features) + ']'

    str_js = "let url = 'http://localhost:5000/served_model/predict/" + \
             served_model_id + "';\n"
    str_js += "let data = {\n"
    str_js += "  input_value: "
    str_js += job_info["served_model"]["input_data_demo_string"] + ",\n"
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
    str_py += "  \"input_value\": " + job_info["served_model"][
        "input_data_demo_string"] + ",\n"
    str_py += "  \"served_model_id\":\"" + served_model_id + "\",\n"
    str_py += "  \"model_name\":\"" + served_model_name + "\",\n"
    str_py += "  \"features\":" + features_str + ",\n"
    str_py += " }\n"
    str_py += "r = requests.post(\"http://localhost:5000/served_model/predict/" + \
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
    user = UserBusiness.get_by_user_ID(new_user_ID)
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


class ProjectService:
    business = ProjectBusiness
    channel = CHANNEL.project

    @classmethod
    def create_tutorial_project(cls, user_ID, name='', description='',
                                tags=None, user_token='', type='project',
                                **kwargs):
        """
        Create a tutorial project

        :param name: str
        :param description: str
        :param user_ID: ObjectId
        :param type: string (app/module/dataset)
        :param tags: list of string
        :param user_token: string
        :return: a new created project object
        """
        name = 'tutorial'
        description = 'this is a official tutorial for our platform beginner'
        tags = ['tutorial', 'official']
        type = 'app'

        if tags is None:
            tags = []
        user = UserBusiness.get_by_user_ID(user_ID)
        project = cls.business.create_project(
            name=name,
            description=description,
            type=type, tags=tags, user=user,
            user_token=user_token,
            create_tutorial=True,
            auto_show_help=True,
            **kwargs)
        return project

    @classmethod
    def create_project(cls, name, description, user_ID, tags=None,
                       user_token='', type='project', **kwargs):
        """
        Create a new project

        :param name: str
        :param description: str
        :param user_ID: ObjectId
        :param type: string (app/module/dataset)
        :param tags: list of string
        :param user_token: string
        :return: a new created project object
        """
        if tags is None:
            tags = []
        project_type = type
        user = UserBusiness.get_by_user_ID(user_ID)
        # message = "{}创建了app{}".format(user.name, name)
        # world_business.system_send(channel=cls.channel, message=message)

        project = cls.business.create_project(name=name,
                                              description=description,
                                              type=type, tags=tags, user=user,
                                              user_token=user_token, **kwargs)

        from server3.service.user_service import UserService
        user, project = UserService.action_entity(user_ID=project.user.user_ID,
                                                  entity_id=project.id,
                                                  action='favor',
                                                  entity=project.type)
        from server3.service.world_service import WorldService
        from server3.business.statistics_business import StatisticsBusiness
        # 记录历史记录
        # statistics = StatisticsBusiness.action(
        #     user_obj=user,
        #     entity_obj=project,
        #     entity_type=type,
        #     action="create"
        # )
        # 记录世界频道消息  # 推送消息
        world = WorldService.system_send(
            channel=CHANNEL.request,
            message=f"用户{project.user.user_ID}创建了{project_type}: {project.name}")

        return project

    @classmethod
    def list_projects(cls, search_query, page_no=None, page_size=None,
                      default_max_score=0.4, privacy=None, user_ID=None,
                      tags=None):
        """
        list projects
        :param search_query:
        :type search_query:
        :param page_no:
        :type page_no:
        :param page_size:
        :type page_size:
        :param default_max_score:
        :type default_max_score:
        :param privacy:
        :type privacy:
        :param user_ID:
        :type user_ID:
        :return:
        :rtype:
        """

        user = None
        if user_ID:
            user = UserBusiness.get_by_user_ID(user_ID)
        return cls.business.get_objects(
            search_query=search_query,
            privacy=privacy,
            page_no=page_no,
            page_size=page_size,
            default_max_score=default_max_score,
            user=user,
            tags=tags,
        )

    @classmethod
    def get_by_id(cls, project_id, **kwargs):
        project = cls.business.get_by_id(project_id)
        # if kwargs.get('commits') == 'true':
        #     commits = cls.business.get_commits(project.path)
        #     project.commits = [{
        #         'message': c.message,
        #         'time': datetime.fromtimestamp(c.time[0] + c.time[1]),
        #     } for c in commits]
        return project

    @classmethod
    def commit(cls, project_id, commit_msg):
        project = cls.business.commit(project_id, commit_msg)
        cls.send_message(project, m_type='commit')
        return project

    @classmethod
    def send_message(cls, project, m_type='publish'):

        if m_type in ['deploy', 'deploy_fail', 'publish_fail']:
            logger_service.emit_anything_notification(
                {'message': {'message_type': m_type,
                             'project_type': project.type,
                             'project_name': project.name}},
                project.user)
            return
        # get app subscriber and user himself
        receivers = project.favor_users
        # receivers.append(project.user.id)

        admin_user = UserBusiness.get_by_user_ID('admin')

        # 获取所有包含此module的答案
        answers_has_module = RequestAnswerBusiness. \
            get_by_anwser_project_id(project.id)
        # 根据答案获取对应的 request 的 owner
        for each_anser in answers_has_module:
            user_request = each_anser.user_request
            request_owener = user_request.user
            MessageService.create_message(admin_user, 'publish_request',
                                          [request_owener],
                                          project.user,
                                          project_name=project.name,
                                          project_id=project.id,
                                          user_request_title=user_request.title,
                                          user_request_id=user_request.id,
                                          project_type=project.type)

        MessageService.create_message(admin_user, m_type, receivers,
                                      project.user, project_name=project.name,
                                      project_id=project.id,
                                      project_type=project.type)
