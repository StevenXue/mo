# -*- coding: UTF-8 -*-
import sys

from os import path

sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

from server.entity.user import User as Instance
from server.repository.general_repo import Repo


class OwnershipRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

# def find(query):
#     return general_repo.find(Instance, query)
#
#
# def find_one(query):
#     return general_repo.find_one(Instance, query)
#
#
# def find_unique_one(query):
#     return general_repo.find_unique_one(Instance, query)
#
#
# def save_one(content):
#     return general_repo.save_one(Instance, content)




