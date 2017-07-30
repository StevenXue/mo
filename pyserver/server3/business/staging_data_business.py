# -*- coding: UTF-8 -*-
from bson import ObjectId

from server3.entity.staging_data import StagingData
from server3.repository.staging_data_repo import StagingDataRepo
staging_data_repo = StagingDataRepo(StagingData)


def get_fields_by_map_reduce(staging_data_set_id, mapper, reducer):
    """
    get fields of staging data by staging_data_set_id
    :param staging_data_set_id: ObjectId
    :param mapper: str
    :param reducer: str
    :return: list of staging data objects
    """
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
    staging_data_repo.delete_by_non_unique_field('staging_data_set',
                                                 staging_data_set_id)
    # sd_objects = get_by_staging_data_set_id(staging_data_set_id)
    # for obj in sd_objects:
    #     obj.delete()


def add(staging_data_set, other_fields_obj):
    """
    Add a staging_data object

    :param staging_data_set: staging_data_set object
    :param other_fields_obj: dynamic fields in SON format
    :return: a added staging_data object
    """
    if not staging_data_set:
        raise ValueError('no data_set')
    staging_data = StagingData(staging_data_set=staging_data_set,
                               **other_fields_obj)
    return staging_data_repo.create(staging_data)


def add_many(staging_data_set, data_array):
    if not staging_data_set or not data_array:
        raise ValueError('no data_set or no data_array')
    return staging_data_repo.\
        create_many([StagingData(staging_data_set=staging_data_set, **doc) for
                     doc in data_array])


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


def get_by_staging_data_set_id_limited_fields(staging_data_set_id, fields):
    """
    Get staging_data objects by staging_data_set ObjectId

    :param staging_data_set_id: ObjectId
    :return: matched staging_data objects in list form
    """
    # staging_data_set = StagingDataSet(id=staging_data_set_id)
    # return staging_data_repo.read_by_staging_data_set(staging_data_set)
    return staging_data_repo.read_by_non_unique_field_subset('staging_data_set',
                                                      staging_data_set_id,
                                                      fields)


def get_by_staging_data_set_id_limit(staging_data_set_id, limit):
    """
    Get staging_data objects by staging_data_set ObjectId

    :param staging_data_set_id: ObjectId
    :return: matched staging_data objects in list form
    """
    # staging_data_set = StagingDataSet(id=staging_data_set_id)
    # return staging_data_repo.read_by_staging_data_set(staging_data_set)
    return staging_data_repo.read_by_non_unique_field_limit('staging_data_set',
                                                      staging_data_set_id,
                                                            limit)


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


def update_by_id(data_id, update_query):
    return staging_data_repo.update_one_by_id(data_id, update_query)


def filter_data_set_fields(sds_id, fields):
    return staging_data_repo.update_unset_fields_by_non_unique_field(
               'staging_data_set', sds_id, fields)


def remove_data_by_staging_data_set_id(sds_id):
    return staging_data_repo.\
        delete_by_non_unique_field('staging_data_set', sds_id)


def remove_data_by_ids(sd_ids):
    for sd_id in sd_ids:
        remove_data_by_id(sd_id)


def remove_data_by_id(sd_id):
    return staging_data_repo.delete_by_id(sd_id)
