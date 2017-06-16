# -*- coding: UTF-8 -*-
from repository.general_repo import Repo


class UserRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def read_by_user_ID(self, user_ID):
        return Repo.read_unique_one(self, {'user_ID': user_ID})

    def delete_by_user_ID(self, user_ID):
        return Repo.delete_unique_one(self, {'user_ID': user_ID})
