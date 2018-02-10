#!/usr/bin/python
# -*- coding: UTF-8 -*-

from datetime import datetime

from server3.entity.user_request import UserRequest
from server3.repository.user_request_repo import UserRequestRepo
from server3.utility import json_utility

user_request_repo = UserRequestRepo(UserRequest)


def get_all_user_request():
    query = {}
    return user_request_repo.read(query)


def get_by_user_request_id(user_request_id):
    return user_request_repo.read_by_unique_field('id', user_request_id)


def add_user_request(title, **kwargs):
    now = datetime.utcnow()
    user_request_obj = UserRequest(title=title,
                                   create_time=now, **kwargs)
    return user_request_repo.create(user_request_obj)


def update_user_request_by_id(user_request_id, **kwargs):
    return user_request_repo.update_one_by_id(user_request_id, kwargs)


def remove_by_id(user_request_id):
    return user_request_repo.delete_by_id(user_request_id)
