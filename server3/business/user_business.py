# -*- coding: UTF-8 -*-
from entity.user import User
from repository.user_repo import UserRepo

user_repo = UserRepo(User)


def add(user_ID, password, kwargs):
    user = User(user_ID=user_ID, password=password, **kwargs)
    return user_repo.create(user)


def get_by_user_ID(user_ID):
    return user_repo.read_by_unique_field('user_ID', user_ID)


def get_by_user_object_id(object_id):
    return user_repo.read_by_id(object_id)


def remove_by_id(user_id):
    return user_repo.delete_by_id(user_id)



