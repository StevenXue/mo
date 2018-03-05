#!/usr/bin/python
# -*- coding: UTF-8 -*-

from datetime import datetime
from bson import ObjectId
from server3.entity.request_answer import RequestAnswer
from server3.repository.request_answer_repo import \
    RequestAnswerRepo
from server3.business.user_request_business import EntityBusiness

request_answer_repo = RequestAnswerRepo(RequestAnswer)


class RequestAnswerBusiness(EntityBusiness):
    entity = RequestAnswer
    repo = RequestAnswerRepo(RequestAnswer)

    @classmethod
    def get_by_user_request_id(cls, user_request_id, get_number=False):
        query = {'user_request_id': ObjectId(user_request_id)}
        if get_number:
            # 返回request的answer的数目
            return cls.repo.read(query).count()
        else:
            # 返回answer
            return cls.repo.read(query)




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


def add_request_answer(**data):
    now = datetime.utcnow()
    request_answer_obj = RequestAnswer(
        create_time=now, **data
        )
    return request_answer_repo.create(request_answer_obj)


def update_request_answer_by_id(request_answer_id, **kwargs):
    return request_answer_repo.update_one_by_id(
        request_answer_id, kwargs)


def remove_by_id(request_answer_id):
    return request_answer_repo.delete_by_id(request_answer_id)

