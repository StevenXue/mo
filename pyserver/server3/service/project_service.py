# -*- coding: UTF-8 -*-
from datetime import datetime
from copy import deepcopy

from mongoengine import DoesNotExist

from server3.service import job_service
from server3.business import project_business
from server3.business import job_business
from server3.business import user_business
from server3.business import ownership_business
from server3.business import result_business
from server3.business import data_set_business
from server3.service import ownership_service
from server3.service import staging_data_service
from server3.business import staging_data_set_business
from server3.utility import json_utility


def create_project(name, description, user_ID, is_private=True):
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
    """
    add job to project
    :param job_obj:
    :param project_id:
    :return:
    """
    return project_business.insert_job_by_id(project_id, job_obj)


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


def get_all_jobs_of_project(project_id, categories):
    """
    get all jobs and job info of a project
    :param project_id:
    :param categories:
    :return:
    """
    jobs = project_business.get_by_id(project_id)['jobs']
    history_jobs = {c: [] for c in categories}
    for job in jobs:
        job_info = job.to_mongo()
        keys = history_jobs.keys()
        for key in keys:
            if job[key]:
                # try:
                #     result_sds = staging_data_set_business.get_by_job_id(
                #         job['id']).to_mongo()
                # except DoesNotExist:
                #     result_sds = None
                job_info[key] = {
                    'name': job[key]['name'],
                }
                if job['staging_data_set']:
                    job_info['staging_data_set'] = \
                        job['staging_data_set']['name']
                    job_info['staging_data_set_id'] = \
                        job['staging_data_set']['id']
                else:
                    job_info['staging_data_set'] = None
                    job_info['staging_data_set_id'] = None
                # job_info['results'] = result_sds
                history_jobs[key].append(job_info)
                break
    return history_jobs


def publish_project(project_id):
    project = project_business.get_by_id(project_id)
    ow = ownership_business.get_ownership_by_owned_item(project, 'project')
    return ownership_business.update_by_id(ow['id'], private=False)


def fork(project_id, new_user_ID):
    """
    fork project
    :param project_id:
    :return:
    """
    # get project
    project = project_business.get_by_id(project_id)

    # get ownership, and check privacy
    ownership = ownership_business.get_ownership_by_owned_item(
        project, 'project')
    if ownership.private is True:
        raise NameError('forked project is private, fork failed')

    # copy and save project
    project_cp = project_business.copy(project)

    # get user object
    user = user_business.get_by_user_ID(new_user_ID)
    # create ownership relation
    ownership_business.add(user, True, project=project_cp)

    # copy jobs and save
    jobs = project.jobs
    jobs_cp = []
    for job in jobs:
        # copy staging data set by job and bind to project
        if hasattr(job, 'staging_data_set') and job.staging_data_set:
            sds_cp = staging_data_service.copy_staging_data_set(
                job.staging_data_set, project_cp)
        else:
            sds_cp = None
        # copy job
        job_cp = job_business.copy_job(job, project_cp, sds_cp)
        jobs_cp.append(job_cp)
        # copy result staging data set by job and bind to project
        try:
            result_sds = staging_data_set_business.get_by_job_id(job['id'])
            staging_data_service.copy_staging_data_set(result_sds, project_cp,
                                                       belonged_job=job_cp)
        except DoesNotExist:
            pass

    project_business.update_by_id(
        project_cp['id'],
        jobs=jobs_cp)
    project_cp.reload()
    return project_cp
