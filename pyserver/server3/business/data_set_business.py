# -*- coding: UTF-8 -*-
import os
from datetime import datetime
from server3.entity.data_set import DataSet
from server3.repository.data_set_repo import DataSetRepo
from server3.repository import config

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')

data_set_repo = DataSetRepo(DataSet)


def add(name, **kwargs):
    create_time = datetime.utcnow()
    data_set = DataSet(name=name, create_time=create_time,
                       upload_time=create_time,
                       **kwargs)
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
