# -*- coding: UTF-8 -*-

from entity.staging_data_set import StagingDataSet
from repository.staging_data_set_repo import StagingDataSetRepo

staging_data_set_repo = StagingDataSetRepo(StagingDataSet)


def get_by_name(name):
    sds = StagingDataSet(name=name)
    return staging_data_set_repo.read_by_name(sds)


def get_by_id(sds_id):
    sds = StagingDataSet(id=sds_id)
    return staging_data_set_repo.read_by_id(sds)


def add(name, description, project):
    if not name or not description or not project:
        raise ValueError('no name or no description or no project')
    staging_data_set = StagingDataSet(name=name, description=description,
                                      project=project)
    return staging_data_set_repo.create(staging_data_set)


def remove_by_id(sds_id):
    return staging_data_set_repo.delete(get_by_id(sds_id))

