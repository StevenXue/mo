# -*- coding: UTF-8 -*-
from entity.data import Data as Instance
from repository.general_repo import Repo


class DataRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

# def create_one(new_data):
#     general_repo.create_one(Instance, new_data)



