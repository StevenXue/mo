# -*- coding: UTF-8 -*-

from entity.staging_data_set import StagingDataSet
from entity.project import Project
from repository.staging_data_set_repo import StagingDataSetRepo

staging_data_set_repo = StagingDataSetRepo(StagingDataSet)


def get_by_id(sds_id):
    """
    Get staging_data_set by its ObjectId

    :param sds_id: staging_data_set ObjectId
    :return: staging_data_set object
    """
    sds = StagingDataSet(id=sds_id)
    return staging_data_set_repo.read_by_id(sds)


def get_by_project_id(project_id):
    """
    Get stating_data_set by project's ObjectId

    :param project_id: ObjectId
    :return: staging_data_set object
    """
    project = Project(id=project_id)
    return staging_data_set_repo.read_by_project(project)


def add(name, description, project):
    """
    Add a new staging_dat_set

    :param name: str
    :param description: str
    :param project: ObjectId or Object
    :return: an added staging_data_set object
    """
    if not name or not description or not project:
        raise ValueError('no name or no description or no project')
    staging_data_set = StagingDataSet(name=name, description=description,
                                      project=project)
    return staging_data_set_repo.create(staging_data_set)


def remove_by_id(sds_id):
    """
    Remove a staging_data_set by its ObjectId

    :param sds_id: staging_data_set's ObjectId
    :return: None
    """
    return staging_data_set_repo.delete(get_by_id(sds_id))

