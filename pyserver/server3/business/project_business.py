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

project_repo = ProjectRepo(Project)


def add(name, description, related_fields,
        tags, related_tasks):
    """
    Add a new Project.

    :param name: str
    :param description: str
    :param create_time: utc time
    :return: added Project object
    """
    project_obj = Project(name=name, description=description,
                          create_time=datetime.utcnow(),
                          related_fields=related_fields,
                          tags=tags, related_tasks=related_tasks)
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
    return project_repo.insert_to_list_fields_by_id(project_id,
                                                    {'jobs': job_obj})


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