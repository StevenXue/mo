# -*- coding: UTF-8 -*-

from server3.service import user_service
from server3.business import user_request_business
from server3.business import user_business
from server3.business import ownership_business
from server3.repository import config
from server3.utility import json_utility
from server3.business import world_business
from server3.entity.world import Channel
from server3.business.user_request_business import UserRequestBusiness
from server3.business.request_answer_business import RequestAnswerBusiness


class EntityMapper:
    userRequest = UserRequestBusiness
    requestAnswer = RequestAnswerBusiness

    @classmethod
    def get(cls, attr='userRequest'):
        return getattr(cls, attr)


def get_user_request_list():
    user_requests = user_request_business.get_all_user_request()  # 分页
    return user_requests.order_by('-create_time')


def get_all_user_request():
    user_request = user_request_business.get_all_user_request()
    return user_request


def list_user_request_by_user_ID(user_ID, order=-1):

    user = user_business.get_by_user_ID(user_ID)
    user_request = ownership_business. \
        get_ownership_objects_by_user(user, 'user_request')
    if order == -1:
        user_request.reverse()
    return user_request


def get_list(search_query, user_ID, page_no, page_size, entity_type='userRequest'):
    user = user_business.get_by_user_ID(user_ID) if user_ID else None
    cls = EntityMapper.get(entity_type)
    user_request, total_number = cls.get_list(search_query, user, False,
                                              page_no, page_size,
                                              get_total_number=True)
    return user_request, total_number


def get_by_id(user_request_id, entity_type='userRequest'):
    # user_request = user_request_business.get_by_user_request_id(user_request_id)
    cls = EntityMapper.get(entity_type)
    user_request = cls.get_by_id(user_request_id)
    return user_request


def remove_by_id(user_request_id, user_ID, entity_type='userRequest'):
    cls = EntityMapper.get(entity_type)
    return cls.remove_by_id(user_request_id, user_ID)


def remove_by_user_ID(user_ID, entity_type='userRequest'):
    user = user_business.get_by_user_ID(user_ID)
    cls = EntityMapper.get(entity_type)
    return cls.remove_all_by_user(user)


def create_request_message(request):
    # tmp = "用户super_user发布了需求匹配夫妻脸"
    user = request.user
    return "用户{}发布了需求{}".format(user.name, request.title)


def create_user_request(title, user_ID, **kwargs):
    # create a new user_request object
    user = user_business.get_by_user_ID(user_ID)
    created_user_request = user_request_business.add_user_request(
        title=title,
        user=user,
        status=0,
        **kwargs)
    if created_user_request:
        # 默认发布者star
        created_user_request = user_service.update_request_star(created_user_request.id, user_ID)
        # 消息推送
        message = create_request_message(created_user_request)
        world_business.system_send(channel=Channel.request, message=message)
        # get user object
        user = user_business.get_by_user_ID(user_ID=user_ID)
        # create ownership relation
        if ownership_business.add(user, user_request=created_user_request):
            return created_user_request
        else:
            raise RuntimeError(
                'Cannot create ownership of the new user_request')
    else:
        raise RuntimeError('Cannot create the new user_request')


def update_user_request(user_request_id, request_title, request_description,
                        request_dataset=None):
    user_request = user_request_business.get_by_user_request_id(user_request_id)
    ow = ownership_business.get_ownership_by_owned_item(user_request,
                                                        'user_request')
    user_request_business.update_user_request_by_id(
        user_request_id=user_request_id,
        request_title=request_title,
        request_description=request_description,
        request_dataset=request_dataset)


def remove_user_request_by_id(user_request_id, user_ID):
    user_request = user_request_business.get_by_user_request_id(user_request_id)
    # check ownership
    ownership = ownership_business.get_ownership_by_owned_item(user_request,
                                                               'user_request')
    if user_ID != ownership.user.user_ID:
        raise ValueError('this request not belong to this user, cannot delete')
    return user_request_business.remove_by_id(user_request_id)


