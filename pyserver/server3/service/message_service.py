# -*- coding: UTF-8 -*-

from server3.business import user_request_business
from server3.business import user_business
from server3.business import ownership_business
from server3.service import ownership_service
from server3.repository import config
from server3.utility import json_utility
from server3.business import message_business
from server3.business import user_business


def get_by_user_id(user_id):
    messages = message_business.get_by_user_id(user_id)
    return messages


def create_message(sender, message_type, receivers,  **kwargs):
    # create a new message object
    created_message = message_business.add_message\
        (sender, message_type, receivers, **kwargs)
    if created_message:
        return created_message
    else:
        raise RuntimeError('Cannot create the new message')

