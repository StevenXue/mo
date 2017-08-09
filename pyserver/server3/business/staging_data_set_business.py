# -*- coding: UTF-8 -*-
from copy import deepcopy

from server3.entity.staging_data_set import StagingDataSet
from server3.entity.project import Project
from server3.repository.staging_data_set_repo import StagingDataSetRepo

staging_data_set_repo = StagingDataSetRepo(StagingDataSet)


def get_by_id(sds_id):
    """
    Get staging_data_set by its ObjectId

    :param sds_id: staging_data_set ObjectId
    :return: staging_data_set object
    """
    return staging_data_set_repo.read_by_id(sds_id)


def get_by_project_id(project_id, without_result):
    """
    Get stating_data_set by project's ObjectId

    :param project_id: ObjectId
    :return: staging_data_set object
    """
    if without_result:
        return staging_data_set_repo.read_by_non_unique_field_without_result(
            'project', project_id)
    return staging_data_set_repo.read_by_non_unique_field('project', project_id)


def get_by_name_and_project(name, project):
    return staging_data_set_repo.read_by_name_and_project(name, project)


def get_by_job_id(job_id):
    """
    Get stating_data_set by job's ObjectId

    :param job_id: ObjectId
    :return: staging_data_set object
    """
    # project = Project(id=project_id)
    # return staging_data_set_repo.read_by_project(project)
    return staging_data_set_repo.read_by_unique_field('job', job_id)


def add(name, description, project, **kwargs):
    """
    Add a new staging_dat_set

    :param name: str
    :param description: str
    :param project: ObjectId or Object
    :param kwargs: other params
    :return: an added staging_data_set object
    """
    if not name or not description or not project:
        raise ValueError('no name or no description or no project')
    staging_data_set = StagingDataSet(name=name, description=description,
                                      project=project, **kwargs)
    return staging_data_set_repo.create(staging_data_set)


def update(sds_id, **update):
    return staging_data_set_repo.update_one_by_id(sds_id, update)


def update_job_by_name_and_project(name, project, job):
    return staging_data_set_repo.update_by_name_and_project(name, project,
                                                            'job', job)


def remove_by_id(sds_id):
    """
    Remove a staging_data_set by its ObjectId

    :param sds_id: staging_data_set's ObjectId
    :return: None
    """
    return staging_data_set_repo.delete_by_id(sds_id)


def copy_staging_data_set(sds, belonged_project=None, belonged_job=None):
    """
    copy_staging_data_set
    :param sds:
    :param belonged_project:
    :param belonged_job:
    :return:
    """
    sds_cp = deepcopy(sds)
    sds_cp.id = None
    sds_cp.project = belonged_project
    if belonged_job:
        sds_cp.job = belonged_job
    staging_data_set_repo.create(sds_cp)
    return sds_cp

