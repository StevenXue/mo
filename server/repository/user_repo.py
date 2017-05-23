# -*- coding: UTF-8 -*-
import sys

from os import path

sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

# from server.entity.user import User
from server.repository.general_repo import Repo


# user = user.User()


class UserRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def find_by_user_id(user_id):
        pass
# def find(query):
#     return general_repo.find(User, query)
#
#
# def find_one(query):
#     return general_repo.find_one(User, query)


# def find_unique_one_by_user_id(User, user_id):
#     return general_repo.find_unique_one(User, {'user_id': user_id})


# def save_one(content):
#     return general_repo.save_one(User, content)
#
#
