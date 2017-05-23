# -*- coding: UTF-8 -*-
from server.repository.general_repo import Repo


class DataSetRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

# def save_one(new_ds):
#     general_repo.save_one(Instance, new_ds)
#
#
# def find_first_one(query):
#     general_repo.find_first_one(Instance, query)
