# -*- coding: UTF-8 -*-
from datetime import datetime

from mongoengine import DoesNotExist

from server3.service import job_service
from server3.business import project_business
from server3.business import job_business
from server3.business import user_business
from server3.business import ownership_business
from server3.business import result_business
from server3.business import data_set_business
from server3.service import ownership_service
from server3.business import staging_data_set_business
from server3.utility import json_utility


def create_project(name, description, user_ID, is_private):
    """
    Create a new project

    :param name: str
    :param description: str
    :param user_ID: ObjectId
    :param is_private: boolean
    :return: a new created project object
    """

    # create a new project object
    created_project = project_business.add(name, description, datetime.utcnow())
    if created_project:
        # create project successfully

        # get user object
        user = user_business.get_by_user_ID(user_ID)

        # create ownership relation
        if ownership_business.add(user, is_private, project=created_project):
            return created_project
        else:
            raise RuntimeError('Cannot create ownership of the new project')
    else:
        raise RuntimeError('Cannot create the new project')


def list_projects_by_user_ID(user_ID, order=-1):
    if not user_ID:
        raise ValueError('no user id')
    public_projects = ownership_service.get_all_public_objects('project')
    owned_projects = ownership_service. \
        get_private_ownership_objects_by_user_ID(user_ID, 'project')

    if order == -1:
        public_projects.reverse()
        owned_projects.reverse()
    return public_projects, owned_projects


def remove_project_by_id(project_id):
    """
    remove project by its object_id
    :param project_id: object_id of project to remove
    :return:
    """
    project = project_business.get_by_id(project_id)
    for job in project['jobs']:
        job_business.remove_by_id(job['id'])
    for result in project['results']:
        result_business.remove_by_id(result['id'])
    return project_business.remove_by_id(project_id)


def add_job_to_project(job_obj, project_id):
    return project_business.insert_job_by_id(project_id, job_obj)


def add_job_and_result_to_project(result_obj, project_id):
    job_obj = job_service.get_job_from_result(result_obj)
    return project_business.add_and_update_one_by_id(project_id, result_obj,
                                                     job_obj)


def get_all_jobs_of_project(project_id, categories):
    jobs = project_business.get_by_id(project_id)['jobs']
    history_jobs = {c: [] for c in categories}
    for job in jobs:
        job_info = job.to_mongo()
        keys = history_jobs.keys()
        for key in keys:
            if job[key]:
                try:
                    result_sds = staging_data_set_business.get_by_job_id(
                        job['id']).to_mongo()
                except DoesNotExist:
                    result_sds = None
                job_info[key] = {
                    'name': job[key]['name'],
                }
                job_info['staging_data_set'] = job['staging_data_set']['name']
                job_info['staging_data_set_id'] = job['staging_data_set']['id']
                job_info['results'] = result_sds
                history_jobs[key].append(job_info)
                break
    return history_jobs
