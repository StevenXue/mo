# -*- coding: UTF-8 -*-
from datetime import datetime
from copy import deepcopy
import shutil
import os

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
from server3.repository import config

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')


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
    try:
        for job in project['jobs']:
            job_business.remove_by_id(job['id'])
        for result in project['results']:
            result_business.remove_by_id(result['id'])
    except TypeError:
        pass
    # delete project directory
    project_directory = UPLOAD_FOLDER + user_ID + '/' + project.name
    if os.path.isdir(project_directory):
        shutil.rmtree(project_directory)
    # delete project object
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
        # keys = history_jobs.keys()
        for key in categories:
            if job[key]:
                job_info = job.to_mongo()
                try:
                    result_sds = staging_data_set_business.get_by_job_id(job['id']).to_mongo()
                except DoesNotExist:
                    result_sds = None
                job_info[key] = {
                    'name': job[key]['name'],
                    'category': job[key]['category'],
                }
                job_info['staging_data_set'] = job['staging_data_set']['name'] if job['staging_data_set'] else None
                job_info['staging_data_set_id'] = job['staging_data_set']['id'] if job['staging_data_set'] else None
                if key == 'model':
                    job_info['results'] = result_sds
                else:
                    job_info['results'] = result_sds['result'] if result_sds and "result" in result_sds else None
                job_info['results_staging_data_set_id'] = result_sds['_id'] if result_sds else None
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
