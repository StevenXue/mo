# -*- coding: UTF-8 -*-
from repository.general_repo import Repo


class DataSetRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

# def create_one(new_ds):
#     general_repo.create_one(Instance, new_ds)
#
#
# def read_first_one(query):
#     general_repo.read_first_one(Instance, query)
