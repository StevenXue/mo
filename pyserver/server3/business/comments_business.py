#!/usr/bin/python
# -*- coding: UTF-8 -*-

from datetime import datetime
from flask import jsonify
from bson import ObjectId
from server3.entity.comments import Comments
from server3.repository.comments_repo import \
    CommentsRepo
from server3.business.general_business import GeneralBusiness


class CommentsBusiness(GeneralBusiness):
    repo = CommentsRepo(Comments)

    @classmethod
    def get_comments(cls, _id, comments_type):
        # _id 是 request 或 answer 或 project 的 id
        if comments_type == 'request':
            query = {'user_request': ObjectId(_id)}
        elif comments_type == 'answer':
            query = {'user_request': ObjectId(_id)}
        elif comments_type == 'project':
            query = {'user_request': ObjectId(_id)}
        else:
            return jsonify({'response': 'error comments type'}), 400
        return cls.repo.read(query)

    @classmethod
    def count_comments(cls, _id, comments_type):
        # _id 是 request 或 answer 或 project 的 id
        if comments_type == 'request':
            query = {'user_request': ObjectId(_id)}
        elif comments_type == 'answer':
            query = {'user_request': ObjectId(_id)}
        elif comments_type == 'project':
            query = {'user_request': ObjectId(_id)}
        else:
            return jsonify({'response': 'error comments type'}), 400
        return cls.repo.read(query).count()

    @classmethod
    def add_comments(cls, _id, comments_user, comments, comments_type):
        # _id 是 request 或 answer 或 project 的 id
        kw = {
            'create_time': datetime.utcnow(),
            'comments_user': comments_user,
            'comments': comments,
        }
        if comments_type == 'request':
            kw['request'] = ObjectId(_id)
        elif comments_type == 'answer':
            kw['answer'] = ObjectId(_id)
        elif comments_type == 'project':
            kw['project'] = ObjectId(_id)
        else:
            return jsonify({'response': 'error comments type'}), 400
        return cls.repo.create(Comments(**kw))

    @classmethod
    def update_by_id(cls, _id, user, comments):
        # todo check auth
        kw = {
            'update_time': datetime.utcnow(),
            'comments': comments,
        }
        return cls.repo.update_one_by_id(_id, **kw)

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

    # @classmethod
    # def get_by_user_request_comments_id(cls, user_request_comments_id):
    #     return cls.repo.read_by_unique_field(
    #         'id',
    #         user_request_comments_id
    #     )

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
    def add_project_comments(cls, project_id, comments_user,
                             comments, comments_type):

        kw = {
            'project': ObjectId(project_id),
            'create_time': datetime.utcnow(),
            'comments_user': comments_user,
            'comments': comments,
            'comments_type': comments_type,
        }
        project_comments_obj = Comments(**kw)
        return cls.repo.create(project_comments_obj)

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
