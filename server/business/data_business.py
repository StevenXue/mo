# -*- coding: UTF-8 -*-

from entity.data import Data
from repository.data_repo import DataRepo

data_repo = DataRepo(Data)


def add(data_set, other_fields_obj):
    if not data_set or not other_fields_obj:
        raise ValueError('no data_set or no other_fields')
    data = Data(data_set=data_set, **other_fields_obj)
    return data_repo.create(data)

