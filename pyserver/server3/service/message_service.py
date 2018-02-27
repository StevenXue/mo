# -*- coding: UTF-8 -*-

from server3.business import user_request_business
from server3.business import user_business
from server3.business import ownership_business
from server3.service import ownership_service
from server3.repository import config
from server3.utility import json_utility
from server3.business import message_business
from server3.business import user_business
from server3.service import logger_service

def get_by_user_id(user_id):
    messages = message_business.get_by_user_id(user_id)
    return messages


def get_by_user_ID(user_ID):
    user = user_business.get_by_user_ID(user_ID)
    user_id = user.id
    messages = message_business.get_by_user_id(user_id)
    return messages


def create_message(sender, message_type, receivers,  **kwargs):
    # create a new message object
    created_message = message_business.add_message\
        (sender, message_type, receivers, **kwargs)
    if created_message:
        logger_service.emit_notification(created_message, receivers)
        return created_message
    else:
        raise RuntimeError('Cannot create the new message')


def read_message(user_ID, receiver_id):
    user = user_business.get_by_user_ID(user_ID)
    user_id = user.id
    # 用户点击未读信息后，将信息状态更改为已读
    message_business.read_message(user_id, receiver_id)
