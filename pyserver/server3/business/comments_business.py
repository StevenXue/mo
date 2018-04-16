#!/usr/bin/python
# -*- coding: UTF-8 -*-

from datetime import datetime
from bson import ObjectId
from server3.entity.comments import Comments
from server3.repository.comments_repo import \
    CommentsRepo
from server3.business.general_business import GeneralBusiness


# comments_repo = CommentsRepo(Comments)

def check_auth(cls):
    def _deco(func):
        def __deco(user_request_comments_id, user_ID, *args, **kwargs):
            comment = cls.get_by_id(user_request_comments_id)
            if comment.comments_user_ID == user_ID:
                return func(user_request_comments_id, user_ID, *args, **kwargs)
            else:
                raise RuntimeError('no right to delete')
        return __deco
    return _deco


class CommentsBusiness(GeneralBusiness):
    repo = CommentsRepo(Comments)

    @classmethod
    def get_comments_of_this_user_request(cls, user_request_id):
        query = {'user_request': ObjectId(user_request_id),
                 'comments_type': 'request'}
        return cls.repo.read(query)

    @classmethod
    def count_comments_of_this_user_request(cls, user_request_id):
        query = {'user_request': ObjectId(user_request_id),
                 'comments_type': 'request'}
        return cls.repo.read(query).count()

    @classmethod
    def get_comments_of_this_answer(cls, request_answer_id):
        query = {'request_answer': ObjectId(request_answer_id)}
        return cls.repo.read(query)

    @classmethod
    def get_by_user_request_comments_id(cls, user_request_comments_id):
        return cls.repo.read_by_unique_field(
            'id',
            user_request_comments_id
        )

    @classmethod
    def add_user_request_comments(cls, user_request_id, comments_user_ID,
                                  comments, comments_type, request_answer_id):
        kw = {
            'user_request': ObjectId(user_request_id),
            'create_time': datetime.utcnow(),
            'comments_user_ID': comments_user_ID,
            'comments': comments,
            'comments_type': comments_type,
        }
        if request_answer_id:
            kw['request_answer'] = ObjectId(request_answer_id)
        user_request_comments_obj = Comments(**kw)
        return cls.repo.create(user_request_comments_obj)

    @classmethod
    def update_user_request_comments_by_id(cls, user_request_comments_id,
                                           **kwargs):
        kwargs['create_time'] = datetime.utcnow()
        return cls.repo.update_one_by_id(
            user_request_comments_id, kwargs)

    @classmethod
    @check_auth
    def remove_by_id(cls, user_request_comments_id, user_ID):
        return cls.repo.delete_by_id(user_request_comments_id)




# # 获取当前user_request下的所有
# def get_comments_of_this_user_request(user_request_id):
#     query = {'user_request': ObjectId(user_request_id),
#              'comments_type': 'request'}
#     return comments_repo.read(query)
#
#
# def count_comments_of_this_user_request(user_request_id):
#     query = {'user_request': ObjectId(user_request_id),
#              'comments_type': 'request'}
#     return comments_repo.read(query).count()
#
#
# def get_comments_of_this_answer(request_answer_id):
#     query = {'request_answer': ObjectId(request_answer_id)}
#     return comments_repo.read(query)
#
#
# def get_by_user_request_comments_id(user_request_comments_id):
#     return comments_repo.read_by_unique_field(
#         'id',
#         user_request_comments_id
#     )
#
#
# def add_user_request_comments(user_request_id, comments_user_ID, comments,
#                               comments_type, request_answer_id):
#     kw = {
#         'user_request': ObjectId(user_request_id),
#         'create_time': datetime.utcnow(),
#         'comments_user_ID': comments_user_ID,
#         'comments': comments,
#         'comments_type': comments_type,
#     }
#     # print('request_answer')
#     # print(request_answer)
#     if request_answer_id:
#         kw['request_answer'] = ObjectId(request_answer_id)
#     user_request_comments_obj = Comments(**kw)
#     return comments_repo.create(user_request_comments_obj)
#
#
# def update_user_request_comments_by_id(user_request_comments_id, **kwargs):
#     kwargs['create_time'] = datetime.utcnow()
#     return comments_repo.update_one_by_id(
#         user_request_comments_id, kwargs)
#
#
# def remove_by_id(user_request_comments_id):
#     return comments_repo.delete_by_id(user_request_comments_id)
