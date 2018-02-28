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
    kwargs['create_time'] = datetime.utcnow()
    return user_request_repo.update_one_by_id(
        user_request_id, kwargs)


def remove_by_id(user_request_id):
    return user_request_repo.delete_by_id(user_request_id)


class EntityBusiness:
    entity = None
    repo = None

    DEFAULT_PAGE_NO = 1
    DEFAULT_PAGE_SIZE = 5

    @classmethod
    def get_by_id(cls, object_id):
        """
        Get a project object by its ObjectId

        :param object_id: ObjectId
        :return: a matched Project object
        """
        entity = cls.repo.read_by_id(object_id)
        cls.entity = entity
        return entity

    @classmethod
    def get_list(cls, search_query, user, privacy,
                 page_no=DEFAULT_PAGE_NO,
                 page_size=DEFAULT_PAGE_SIZE,
                 get_total_number=False):

        start = (page_no - 1) * page_size
        end = page_no * page_size
        # 获取所有的
        if search_query:
            objects = cls.repo.search(search_query)
        else:
            objects = cls.repo.read()  # 分页
        if privacy:
            objects = objects(privacy=privacy)
        if user:
            objects = objects(user=user)
        if get_total_number:
            number_of_objects = objects.count()
            return objects.order_by('-create_time')[start:end], number_of_objects
        else:
            return objects.order_by('-create_time')[start:end]


    @classmethod
    def remove_by_id(cls, object_id, user_ID):
        """
        Get a project object by its ObjectId

        :param object_id: ObjectId
        :return: a matched Project object
        """
        entity = cls.repo.read_by_id(object_id)
        if user_ID != entity.user.user_ID:
            raise ValueError('project not belong to this user, cannot delete')
        return cls.repo.delete_by_id(object_id)


class UserRequestBusiness(EntityBusiness):
    entity = UserRequest
    repo = UserRequestRepo(UserRequest)

    @classmethod
    def remove_all_by_user(cls, user):
        objects = cls.repo.read()
        objects = objects(user=user)
        objects.delete()