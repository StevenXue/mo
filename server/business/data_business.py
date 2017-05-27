# -*- coding: UTF-8 -*-

from entity.data import Data
from repository.data_repo import DataRepo

data_repo = DataRepo(Data)


def add(data_set, other_fields_dict):
    if not data_set or not other_fields_dict:
        raise ValueError('no data_set or no other_fields')
    data = Data(data_set=data_set, **other_fields_dict)
    return data_repo.create(data)


def get_by_data_set(data_set):
    data = Data(data_set=data_set)
    return data_repo.read_by_data_set(data)

