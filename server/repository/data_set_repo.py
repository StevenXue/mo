# -*- coding: UTF-8 -*-
import sys

from os import path

sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

from server.repository.general_repo import Repo


class DataSetRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

# def save_one(new_ds):
#     general_repo.save_one(Instance, new_ds)
#
#
# def find_one(query):
#     general_repo.find_one(Instance, query)
