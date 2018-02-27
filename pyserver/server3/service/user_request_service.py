# -*- coding: UTF-8 -*-

from server3.service import user_service
from server3.business import user_request_business
from server3.business import user_business
from server3.business import ownership_business
from server3.service import ownership_service
from server3.repository import config
from server3.utility import json_utility
from server3.business import world_business
from server3.entity.world import Channel
UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')


def get_all_user_request():
    user_request = user_request_business.get_all_user_request()
    return user_request


def get_by_id(user_request_id):
    user_request = user_request_business.get_by_user_request_id(user_request_id)
    return user_request


def create_request_message(request):
    # tmp = "用户super_user发布了需求匹配夫妻脸"
    user_id = request.user_id
    user = user_business.get_by_user_ID(user_id)
    return "用户{}发布了需求{}".format(user.name, request.title)


def create_user_request(request_title, user_id, **kwargs):
    # create a new user_request object
    created_user_request = user_request_business.add_user_request(
        title=request_title,
        user_id=user_id,
        status=0,
        **kwargs)
    if created_user_request:
        # 默认发布者star
        user_service.update_request_star(
            created_user_request.id, user_id)
        # 消息推送
        message = create_request_message(created_user_request)
        world_business.system_send(channel=Channel.request, message=message)
        # get user object
        user = user_business.get_by_user_ID(user_ID=user_id)
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


def list_user_request_by_user_ID(user_ID, order=-1):

    user_request = ownership_service. \
            get_ownership_objects_by_user_ID(user_ID, 'user_request')
    if order == -1:
        user_request.reverse()
    return user_request


def remove_user_request_by_id(user_request_id, user_ID):
    user_request = user_request_business.get_by_user_request_id(user_request_id)
    # check ownership
    ownership = ownership_business.get_ownership_by_owned_item(user_request,
                                                               'user_request')
    if user_ID != ownership.user.user_ID:
        raise ValueError('this request not belong to this user, cannot delete')
    return user_request_business.remove_by_id(user_request_id)
