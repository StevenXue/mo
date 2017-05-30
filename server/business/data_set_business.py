# -*- coding: UTF-8 -*-

from entity.data_set import DataSet
from repository.data_set_repo import DataSetRepo

data_set_repo = DataSetRepo(DataSet)


def add(name, description):
    if not name or not description:
        raise ValueError('no name or no description')
    data_set = DataSet(name=name, description=description)
    return data_set_repo.create(data_set)


# def get_by_name(name):
    # ds = DataSet(name=name)
    # return data_set_repo.read_by_name(name)


def get_by_id(data_set_id):
    return data_set_repo.read_by_id(data_set_id)

