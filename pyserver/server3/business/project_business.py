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
from copy import deepcopy
from datetime import datetime

from server3.entity.project import Project
# from server3.repository import job_repo
from server3.repository.project_repo import ProjectRepo

PAGE_NO = 1
PAGE_SIZE = 5

project_repo = ProjectRepo(Project)


class ProjectBusiness:
    repo = project_repo

    @classmethod
    def get_objects(cls, search_query, user_ID, page_no=PAGE_NO,
                    page_size=PAGE_SIZE, default_max_score=0.4):
        start = (page_no - 1) * page_size
        end = page_no * page_size
        # 获取所有的
        if search_query:
            # apis = Api.objects.search_text(search_query).order_by('$text_score')
            objects = cls.repo.search(search_query)
        else:
            objects = cls.repo.read({})  # 分页
        return objects.order_by('-create_time')[start:end]


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
