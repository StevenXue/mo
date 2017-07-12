# -*- coding: UTF-8 -*-

from server3.entity import data
from server3.entity.data import Data
from server3.repository.data_repo import DataRepo

data_repo = DataRepo(Data)


def add(data_set, other_fields_dict):
    if not data_set or not other_fields_dict:
        raise ValueError('no data_set or no other_fields')
    return data_repo.create(Data(data_set=data_set, **other_fields_dict))


def add_many(data_set, data_array):
    if not data_set or not data_array:
        raise ValueError('no data_set or no data_array')
    return data_repo.create_many([Data(data_set=data_set, **doc) for doc in
                                 data_array])


def get_by_data_set(data_set):
    return data_repo.read_by_non_unique_field('data_set', data_set)


def get_by_data_set_limit(data_set, limit):
    return data_repo.read_by_non_unique_field_limit('data_set', data_set, limit)


def get_fields_by_map_reduce(data_set_id, mapper, reducer):
    return Data.objects(
        data_set=data_set_id). \
        map_reduce(mapper, reducer, 'inline')


def update_by_id(data_id, update_query):
    return data_repo.update_one_by_id(data_id, update_query)


def filter_data_set_fields(data_set_id, fields):
    return data_repo.update_unset_fields_by_non_unique_field('data_set',
                                                             data_set_id,
                                                             fields)


def remove_data_by_data_set_id(data_set_id):
    return data_repo.delete_by_non_unique_field('data_set', data_set_id)