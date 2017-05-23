# -*- coding: UTF-8 -*-
from entity.user import User as Instance
from repository.general_repo import Repo


class OwnershipRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

# def read(query):
#     return general_repo.read(Instance, query)
#
#
# def read_first_one(query):
#     return general_repo.read_first_one(Instance, query)
#
#
# def read_unique_one(query):
#     return general_repo.read_unique_one(Instance, query)
#
#
# def create_one(content):
#     return general_repo.create_one(Instance, content)




