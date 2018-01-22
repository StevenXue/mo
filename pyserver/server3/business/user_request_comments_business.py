#!/usr/bin/python
# -*- coding: UTF-8 -*-

from datetime import datetime
from bson import ObjectId
from server3.entity.user_request_comments import UserRequestComments
from server3.repository.user_request_comments_repo import \
    UserRequestCommentsRepo

user_request_comments_repo = UserRequestCommentsRepo(UserRequestComments)


# 获取当前user_request下的所有
def get_all_comments_of_this_user_request(user_request_id):
    query = {'user_request_id': ObjectId(user_request_id)}
    return user_request_comments_repo.read(query)


def get_by_user_request_comments_id(user_request_comments_id):
    return user_request_comments_repo.read_by_unique_field(
        'id',
        user_request_comments_id
    )


def add_user_request_comments(user_request_id, comments_user_id, comments):
    now = datetime.utcnow()
    user_request_comments_obj = UserRequestComments(
        user_request_id=ObjectId(user_request_id),
        create_time=now,
        comments_user_id=comments_user_id,
        comments=comments
        )
    return user_request_comments_repo.create(user_request_comments_obj)


def update_user_request_comments_by_id(user_request_comments_id, **kwargs):
    kwargs['create_time'] = datetime.utcnow()
    return user_request_comments_repo.update_one_by_id(
        user_request_comments_id, kwargs)


def remove_by_id(user_request_comments_id):
    return user_request_comments_repo.delete_by_id(user_request_comments_id)

