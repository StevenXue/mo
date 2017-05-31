# -*- coding: UTF-8 -*-
from repository.general_repo import Repo


class DataSetRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    # def read_by_name(self, data_set_name):
    #     return Repo.read_unique_one(self, {'name': data_set_name})
# def create_one(new_ds):
#     general_repo.create_one(Instance, new_ds)
#
#
# def read_first_one(query):
#     general_repo.read_first_one(Instance, query)
