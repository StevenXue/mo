# -*- coding: UTF-8 -*-

from entity.staging_data import StagingData
from repository.staging_data_repo import StagingDataRepo

staging_data_repo = StagingDataRepo(StagingData)


def remove_by_staging_data_set_id(staging_data_set_id):
    sd_objects = get_by_staging_data_set_id(staging_data_set_id)
    for obj in sd_objects:
        obj.delete()


def add(staging_data_set, other_fields_obj):
    """
    :param staging_data_set: staging_data_set object
    :param other_fields_obj: in SON format
    :return: a staging_data object
    """
    if not staging_data_set or not other_fields_obj:
        raise ValueError('no data_set or no other_fields')
    staging_data = StagingData(staging_data_set=staging_data_set,
                               **other_fields_obj)
    return staging_data_repo.create(staging_data)


def get_first_one_by_staging_data_set(sds_object):
    return staging_data_repo.read_first_one_by_staging_data_set(sds_object)


def get_by_staging_data_set_id(staging_data_set_id):
    staging_data = StagingData(staging_data_set=staging_data_set_id)
    return staging_data_repo.read_by_staging_data_set(staging_data)


def get_by_staging_data_set_and_fields(staging_data_set, fields):
    staging_data = StagingData(staging_data_set=staging_data_set)
    return staging_data_repo.get_by_staging_data_set_and_fields(staging_data,
                                                                fields)
