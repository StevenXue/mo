#!/usr/bin/python
# -*- coding: UTF-8 -*-

from datetime import datetime
from bson import ObjectId
from server3.entity.user_request_comments import UserRequestComments
from server3.repository.user_request_comments_repo import \
    UserRequestCommentsRepo

user_request_comments_repo = UserRequestCommentsRepo(UserRequestComments)


# 获取当前user_request下的所有
def get_comments_of_this_user_request(user_request_id):
    query = {'user_request_id': ObjectId(user_request_id),
             'comments_type': 'request'}
    return user_request_comments_repo.read(query)


def get_comments_of_this_answer(request_answer_id):
    query = {'request_answer_id': ObjectId(request_answer_id)}
    return user_request_comments_repo.read(query)


def get_by_user_request_comments_id(user_request_comments_id):
    return user_request_comments_repo.read_by_unique_field(
        'id',
        user_request_comments_id
    )


def add_user_request_comments(user_request_id, comments_user_id, comments,
                              comments_type, request_answer_id):
    kw = {
        'user_request_id': ObjectId(user_request_id),
        'create_time': datetime.utcnow(),
        'comments_user_id': comments_user_id,
        'comments': comments,
        'comments_type': comments_type,
    }
    # print('request_answer_id')
    # print(request_answer_id)
    if request_answer_id:
        kw['request_answer_id'] = ObjectId(request_answer_id)
    user_request_comments_obj = UserRequestComments(**kw)
    return user_request_comments_repo.create(user_request_comments_obj)


def update_user_request_comments_by_id(user_request_comments_id, **kwargs):
    kwargs['create_time'] = datetime.utcnow()
    return user_request_comments_repo.update_one_by_id(
        user_request_comments_id, kwargs)


def remove_by_id(user_request_comments_id):
    return user_request_comments_repo.delete_by_id(user_request_comments_id)
