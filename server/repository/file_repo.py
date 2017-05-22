# -*- coding: UTF-8 -*-
import sys
from os import path
sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

from server.entity.data import Data
from server.entity.data_set import DataSet
from server.entity.user import User
from server.entity.file import File
from server.repository import general_repo
from server.repository import data_set_repo

# user = user.User


def find(query):
    return general_repo.find(File, query)


def find_one(query):
    return general_repo.find_one(File, query)


def find_unique_one(query):
    return general_repo.find_unique_one(File, query)


# save one in usr path and save the path in db
def create(content):
    return general_repo.save_one(File, content)


def update(document):
    return document


def delete(document):
    return document.delete()





