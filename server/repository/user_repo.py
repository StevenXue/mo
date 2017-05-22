# -*- coding: UTF-8 -*-
import sys
from os import path
sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

from server.entity.data import Data
from server.entity.data_set import DataSet
# from server.entity.user import User
from server.repository import general_repo
from server.repository import data_set_repo

# user = user.User


def find(query):
    pass
    # return general_repo.find(User, query)


def find_one(query):
    pass
    # return general_repo.find_one(User, query)


def find_unique_one(instance, query):
    return general_repo.find_unique_one(instance, query)


def save_one(instance, content):
    return general_repo.save_one(instance, content)




