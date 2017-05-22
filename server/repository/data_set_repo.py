# -*- coding: UTF-8 -*-
import sys
from os import path
sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

from server.entity.data_set import DataSet as Instance
from server.repository import general_repo


def save_one(new_ds):
    general_repo.save_one(Instance, new_ds)


def find_one(query):
    general_repo.find_one(Instance, query)
