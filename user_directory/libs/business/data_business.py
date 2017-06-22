# -*- coding: UTF-8 -*-

from entity import data
from entity.data import Data
from repository.data_repo import DataRepo

data_repo = DataRepo(Data)


def add(data_set, other_fields_dict):
    if not data_set or not other_fields_dict:
        raise ValueError('no data_set or no other_fields')
    data = Data(data_set=data_set, **other_fields_dict)
    return data_repo.create(data)


def get_by_data_set(data_set):
    return data_repo.read_by_non_unique_field('data_set', data_set)


def get_by_data_set_limit(data_set, limit):
    return data_repo.read_by_non_unique_field_limit('data_set', data_set, limit)


def get_fields_by_map_reduce(data_set_id, mapper, reducer):
    return Data.objects(
        data_set=data_set_id). \
        map_reduce(mapper, reducer, 'inline')


def remove_data_by_data_set_id(data_set_id):
    return data_repo.delete_by_non_unique_field('data_set', data_set_id)