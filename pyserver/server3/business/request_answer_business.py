#!/usr/bin/python
# -*- coding: UTF-8 -*-

from datetime import datetime
from bson import ObjectId
from server3.entity.request_answer import RequestAnswer
from server3.repository.request_answer_repo import \
    RequestAnswerRepo

request_answer_repo = RequestAnswerRepo(RequestAnswer)


# 获取当前user_request下的所有
def get_all_answer_of_this_user_request(user_request_id):
    query = {'user_request_id': ObjectId(user_request_id)}
    return request_answer_repo.read(query)


def get_answer_number_of_this_user_request(user_request_id):
    query = {'user_request_id': ObjectId(user_request_id)}
    return request_answer_repo.read(query).count()


def get_by_request_answer_id(request_answer_id):
    return request_answer_repo.read_by_unique_field(
        'id',
        request_answer_id
    )


def add_request_answer(user_request_id, answer_user_id, answer):
    now = datetime.utcnow()
    request_answer_obj = RequestAnswer(
        user_request_id=ObjectId(user_request_id),
        create_time=now,
        answer_user_id=answer_user_id,
        answer=answer
        )
    return request_answer_repo.create(request_answer_obj)


def update_request_answer_by_id(request_answer_id, **kwargs):
    kwargs['create_time'] = datetime.utcnow()
    return request_answer_repo.update_one_by_id(
        request_answer_id, kwargs)


def remove_by_id(request_answer_id):
    return request_answer_repo.delete_by_id(request_answer_id)
