# -*- coding: UTF-8 -*-
import os
import sys
module_path = os.path.abspath(os.path.join('..'))
if module_path not in sys.path:
    sys.path.append('../../')

from bson import ObjectId

from entity import staging_data
from repository import staging_data_repo
from entity.staging_data import StagingData
from repository.staging_data_repo import StagingDataRepo
staging_data_repo = StagingDataRepo(StagingData)


def get_fields_by_map_reduce(staging_data_set_id, mapper, reducer):
    return StagingData.objects(
        staging_data_set=staging_data_set_id).\
        map_reduce(mapper, reducer, 'inline')


def get_by_query_str(**kwargs):
    return staging_data_repo.read(kwargs)


def remove_by_staging_data_set_id(staging_data_set_id):
    """
    Remove a staging_data by its ObjectId

    :param staging_data_set_id: ObjectId
    :return: None
    """
    sd_objects = get_by_staging_data_set_id(staging_data_set_id)
    for obj in sd_objects:
        obj.delete()


def add(staging_data_set, other_fields_obj):
    """
    Add a staging_data object

    :param staging_data_set: staging_data_set object
    :param other_fields_obj: dynamic fields in SON format
    :return: a added staging_data object
    """
    if not staging_data_set or not other_fields_obj:
        raise ValueError('no data_set or no other_fields')
    staging_data = StagingData(staging_data_set=staging_data_set,
                               **other_fields_obj)
    return staging_data_repo.create(staging_data)


def get_first_one_by_staging_data_set_id(staging_data_set_id):
    """
    Get the first object of a staging_data_set

    :param staging_data_set_id: staging_data_set object
    :return: a staging_data object
    """
    return staging_data_repo.read_first_one_by_staging_data_set_id(
           staging_data_set_id)


def get_by_staging_data_set_id(staging_data_set_id):
    """
    Get staging_data objects by staging_data_set ObjectId

    :param staging_data_set_id: ObjectId
    :return: matched staging_data objects in list form
    """
    # staging_data_set = StagingDataSet(id=staging_data_set_id)
    # return staging_data_repo.read_by_staging_data_set(staging_data_set)
    return staging_data_repo.read_by_non_unique_field('staging_data_set',
                                                      staging_data_set_id)


def get_by_staging_data_set_and_fields(staging_data_set_id, fields):
    """
    Get specific fields of a staging_data_set

    :param staging_data_set_id: ObjectId
    :param fields: list of str
    :return: staging_data objects in specific fields
    """
    staging_data = StagingData(staging_data_set=staging_data_set_id)
    return staging_data_repo.read_by_staging_data_set_and_fields(staging_data,
                                                                 fields)
