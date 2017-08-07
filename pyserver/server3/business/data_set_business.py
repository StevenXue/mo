# -*- coding: UTF-8 -*-

from server3.entity.data_set import DataSet
from server3.repository.data_set_repo import DataSetRepo

data_set_repo = DataSetRepo(DataSet)


def add(name, description, **kwargs):
    if not name or not description:
        raise ValueError('no name or no description')
    data_set = DataSet(name=name, description=description, **kwargs)
    return data_set_repo.create(data_set)


# def get_by_name(name):
    # ds = DataSet(name=name)
    # return data_set_repo.read_by_name(name)


def get_by_id(data_set_id):
    return data_set_repo.read_by_id(data_set_id)


def remove_by_id(data_set_id):
    return data_set_repo.delete_by_id(data_set_id)


def remove(data_set_obj):
    return data_set_repo.delete_by_id(data_set_obj.id)

