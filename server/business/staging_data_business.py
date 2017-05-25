# -*- coding: UTF-8 -*-

from entity.staging_data import StagingData
from repository.staging_data_repo import StagingDataRepo

staging_data_repo = StagingDataRepo(StagingData)


def add(staging_data_set, other_fields_obj):
    if not staging_data_set or not other_fields_obj:
        raise ValueError('no data_set or no other_fields')
    staging_data = StagingData(staging_data_set=staging_data_set,
                               **other_fields_obj)
    return staging_data_repo.create(staging_data)


def get_by_staging_data_set(staging_data_set):
    staging_data = StagingData(staging_data_set=staging_data_set)
    return staging_data_repo.get_by_staging_data_set(staging_data)
