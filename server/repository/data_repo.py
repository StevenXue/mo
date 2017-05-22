# -*- coding: UTF-8 -*-
import sys

from os import path

sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

from server.entity.data import Data as Instance
from server.repository.general_repo import Repo


class DataRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

# def save_one(new_data):
#     general_repo.save_one(Instance, new_data)



