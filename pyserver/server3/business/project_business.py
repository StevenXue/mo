# !/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-24 11:00pm
# @function : Getting all of the job of statics analysis
# @running  : python
# Further to FIXME of None
"""
# -*- coding: UTF-8 -*-
import os
import shutil
import requests
from copy import deepcopy
from datetime import datetime

from server3.entity.project import Project
# from server3.repository import job_repo
from server3.repository.project_repo import ProjectRepo
from server3.business import user_business
from server3.constants import USER_DIR
from server3.constants import HUB_SERVER
from server3.constants import ADMIN_TOKEN

PAGE_NO = 1
PAGE_SIZE = 5

project_repo = ProjectRepo(Project)


def add(name, description, tags, type, hub_token, project_path):
    """
    Add a new Project.

    :param name: str
    :param description: str
    :param tags: list
    :param type: str
    :param hub_token: str
    :return: added Project object
    """
    create_time = datetime.utcnow()
    project_obj = Project(name=name, description=description,
                          create_time=create_time, update_time=create_time,
                          type=type, tags=tags, hub_token=hub_token,
                          path=project_path)
    return project_repo.create(project_obj)


def add_by_obj(obj):
    return project_repo.create(obj)


def update_items_to_list_field(project_id, **update):
    project_repo.add_to_set(project_id, **update)


def get_by_id(object_id):
    """
    Get a project object by its ObjectId

    :param object_id: ObjectId
    :return: a matched Project object
    """
    # project = Project(id=object_id)
    return project_repo.read_by_id(object_id)


# def add_job_to_project(job_obj, project_obj):
#     return project_repo.update_one_by_id(project_obj, {'push__job': job_obj})
#
#
# def add_result_to_project(result_obj, project_obj):
#     return project_repo.update_one_by_id(project_obj, {'push__result': result_obj})
#
#
# def test(result_obj, project_obj):
#     return project_repo.add_and_update_one_by_id(project_obj, {'result': result_obj})


def remove_by_id(project_id):
    return project_repo.delete_by_id(project_id)


def insert_job_by_id(project_id, job_obj):
    return project_repo.add_to_set(project_id, jobs=job_obj)


def update_by_id(project_id, **update):
    return project_repo.update_one_by_id(project_id, update)


def add_and_update_one_by_id(project_id, result_obj, job_obj):
    return project_repo.insert_to_list_fields_by_id(project_id,
                                                    {'results': result_obj,
                                                     'jobs': job_obj})


def copy(project):
    project_cp = deepcopy(project)
    project_cp.id = None
    project_cp.jobs = []
    project_repo.create(project_cp)
    return project_cp


class ProjectBusiness:
    repo = ProjectRepo(Project)

    @staticmethod
    def auth_hub_user(user_ID, project_name, user_token):
        """
        auth jupyterhub with user token
        :param user_ID:
        :param project_name:
        :param user_token:
        :return: dict of res json
        """
        return requests.post('{hub_server}/hub/api/authorizations/token'.
                             format(hub_server=HUB_SERVER),
                             json={'username': user_ID + '+' + project_name,
                                   'password': user_token}
                             ).json()

    @staticmethod
    def delete_hub_user(user_ID, project_name):
        """
        auth jupyterhub with user token
        :param user_ID:
        :param project_name:
        :param token:
        :return: dict of res json
        """
        url = '{hub_server}/hub/api/users/{user_ID}+{project_name}'.format(
            hub_server=HUB_SERVER, user_ID=user_ID,
            project_name=project_name)
        return requests.delete(url,
                               headers={
                                   'Authorization': 'token {}'.format(
                                       ADMIN_TOKEN)
                               })

    @staticmethod
    def gen_dir(user_ID, name):
        """
        auth jupyterhub with user token
        :param user_ID:
        :param project_name:
        :param token:
        :return: dict of res json
        """
        # check and create project dir
        project_path = os.path.join(USER_DIR, user_ID, name)
        if not os.path.exists(project_path):
            os.makedirs(project_path)
        else:
            # if exists means project exists
            raise Exception('project exists')
        return project_path

    @classmethod
    def get_objects(cls, search_query, user=None, page_no=PAGE_NO,
                    page_size=PAGE_SIZE, default_max_score=0.4, privacy=None):
        """
        Search for objects

        :param search_query:
        :param user:
        :param page_no:
        :param page_size:
        :param default_max_score:
        :return:
        """
        start = (page_no - 1) * page_size
        end = page_no * page_size
        # 获取所有的
        if search_query:
            objects = cls.repo.search(search_query)
        else:
            objects = cls.repo.read()  # 分页
        if privacy:
            objects = objects(privacy=privacy)
        if user:
            objects = objects(user=user)
        return objects.order_by('-create_time')[start:end]

    @classmethod
    def create_project(cls, name, description, user, privacy='private',
                       tags=[], user_token='', type='app'):
        """
        Create a new project

        :param name: str
        :param description: str
        :param user_ID: ObjectId
        :param is_private: boolean
        :param type: string (app/module/dataset)
        :param tags: list of string
        :param user_token: string
        :return: a new created project object
        """
        user_ID = user.user_ID

        # generate project dir
        project_path = cls.gen_dir(user_ID, name)

        # auth jupyterhub with user token
        res = cls.auth_hub_user(user_ID, name, user_token)

        # create a new project object
        create_time = datetime.utcnow()
        # project_obj = Project(name=name, description=description,
        #                       create_time=create_time, update_time=create_time,
        #                       type=type, tags=tags, hub_token=res.get('token'),
        #                       path=project_path, user=user, privacy=privacy)
        return cls.repo.create_one(name=name, description=description,
                                   create_time=create_time,
                                   update_time=create_time,
                                   type=type, tags=tags,
                                   hub_token=res.get('token'),
                                   path=project_path, user=user,
                                   privacy=privacy)

    @classmethod
    def get_by_id(cls, object_id):
        """
        Get a project object by its ObjectId

        :param object_id: ObjectId
        :return: a matched Project object
        """
        return cls.repo.read_by_id(object_id)

    @classmethod
    def remove_project_by_id(cls, project_id, user_ID):
        """
        remove project by its object_id
        :param project_id: object_id of project to remove
        :return:
        """
        project = cls.get_by_id(project_id)
        # check ownership
        if user_ID != project.user.user_ID:
            raise ValueError('project not belong to this user, cannot delete')
        # delete tmp jupyterhub user
        cls.delete_hub_user(user_ID, project.name)
        # delete project directory
        if os.path.isdir(project.path):
            shutil.rmtree(project.path)
        # delete project object
        return cls.repo.delete_by_id(project_id)

    @classmethod
    def update_project(cls, project_id, description, privacy='private',
                       tags=[]):
        """
        Update project

        :param name: str
        :param description: str
        :param user_ID: ObjectId
        :param is_private: boolean
        :return: a new created project object
        """
        cls.repo.update_one_by_id(project_id, dict(description=description,
                                                   update_time=datetime.utcnow(),
                                                   tags=tags, privacy=privacy))
