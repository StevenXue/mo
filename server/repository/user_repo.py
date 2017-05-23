# -*- coding: UTF-8 -*-
from repository.general_repo import Repo


class UserRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def read_by_user_ID(self, user_obj):
        return Repo.read_unique_one(self, {'user_ID': user_obj.user_ID})

# def read(query):
#     return general_repo.read(User, query)
#
#
# def read_first_one(query):
#     return general_repo.read_first_one(User, query)


# def find_unique_one_by_user_ID(User, user_ID):
#     return general_repo.read_unique_one(User, {'user_ID': user_ID})


# def create_one(content):
#     return general_repo.create_one(User, content)
#
#
