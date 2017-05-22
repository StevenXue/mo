# -*- coding: UTF-8 -*-
import sys

from os import path

sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

from server.entity.data import Data as Instance
from server.repository import general_repo


def save_one(new_data):
    general_repo.save_one(Instance, new_data)



