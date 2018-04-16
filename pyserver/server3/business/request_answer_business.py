#!/usr/bin/python
# -*- coding: UTF-8 -*-

from datetime import datetime
from bson import ObjectId
from server3.entity.request_answer import RequestAnswer
from server3.entity.user_request import UserRequest
from server3.repository.request_answer_repo import \
    RequestAnswerRepo
from server3.business.general_business import GeneralBusiness

# request_answer_repo = RequestAnswerRepo(RequestAnswer)


class RequestAnswerBusiness(GeneralBusiness):
    repo = RequestAnswerRepo(RequestAnswer)

    @classmethod
    def update_request_answer_by_id(cls, request_answer_id, **kwargs):
        return cls.repo.update_one_by_id(
            request_answer_id, kwargs)

    @classmethod
    def add_request_answer(cls, **data):
        now = datetime.utcnow()
        request_answer_obj = RequestAnswer(
            create_time=now, **data
        )
        return cls.repo.create(request_answer_obj)

    @classmethod
    def get_by_anwser_project_id(cls, project_id):
        objects = cls.repo.read()
        objects = objects(select_project=project_id)
        return objects

    @classmethod
    def get_by_user_request_id(cls, user_request_id):
        query = {'user_request': ObjectId(user_request_id)}
        return cls.repo.read(query)

    @classmethod
    def answer_number_of_user_request(cls, user_request_id):
        # 返回request的answer的数目
        query = {'user_request': user_request_id}
        return cls.repo.read(query).count()

    @classmethod
    def get_by_answer_user(cls,
                           user, type, search_query,
                           page_no,
                           page_size):

        start = (page_no - 1) * page_size
        end = page_no * page_size

        if search_query:
            objects = cls.repo.search(search_query,
                                      q_dict={
                                          'answer': 'icontains',
                                      })
        else:
            objects = cls.repo.read()  # 分页

        if type != 'all':
            objects = RequestAnswer.objects(
                user_request__in=UserRequest.objects(type=type))
        objects = objects(answer_user=user)
        number_of_objects = objects.count()
        return objects.order_by('-create_time')[start:end], number_of_objects




# # 获取当前user_request下的所有
# def get_all_answer_of_this_user_request(user_request_id):
#     query = {'user_request': ObjectId(user_request_id)}
#     return request_answer_repo.read(query)
#
#
# def get_answer_number_of_this_user_request(user_request_id):
#     query = {'user_request': ObjectId(user_request_id)}
#     return request_answer_repo.read(query).count()
#
#
# def get_by_request_answer_id(request_answer_id):
#     return request_answer_repo.read_by_unique_field(
#         'id',
#         request_answer_id
#     )
#
#
# def add_request_answer(**data):
#     now = datetime.utcnow()
#     request_answer_obj = RequestAnswer(
#         create_time=now, **data
#     )
#     return request_answer_repo.create(request_answer_obj)
#
#
# def update_request_answer_by_id(request_answer_id, **kwargs):
#     return request_answer_repo.update_one_by_id(
#         request_answer_id, kwargs)
#
#
# def remove_by_id(request_answer_id):
#     return request_answer_repo.delete_by_id(request_answer_id)
