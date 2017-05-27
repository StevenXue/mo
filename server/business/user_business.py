# -*- coding: UTF-8 -*-

from entity.user import User
from repository.user_repo import UserRepo

user_repo = UserRepo(User)


def add(user_ID, password, kwargs):
    user = User(user_ID=user_ID, password=password, **kwargs)
    return user_repo.create(user)


def get_by_user_ID(user_ID):
    user_obj = User(user_ID=user_ID)
    return user_repo.read_by_user_ID(user_obj)
