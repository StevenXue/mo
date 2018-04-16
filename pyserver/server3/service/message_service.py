# -*- coding: UTF-8 -*-
from bson import ObjectId


from server3.business import message_business
from server3.business.user_business import UserBusiness
from server3.service import logger_service


def get_by_user_id(user_id):
    messages = message_business.get_by_user_id(user_id)
    return messages


def get_by_user_ID(user_ID):
    user = UserBusiness.get_by_user_ID(user_ID)
    user_id = user.id
    messages = message_business.get_by_user_id(user_id)
    return messages


def create_message(sender, message_type, receivers, user=None, **kwargs):
    if user and isinstance(user, (str, ObjectId)):
        user = UserBusiness.get_by_id(user)
    if isinstance(sender, (str, ObjectId)):
        sender = UserBusiness.get_by_id(sender)
    receivers = [UserBusiness.get_by_id(r)
                 if isinstance(r, (str, ObjectId)) else r for r in receivers]
    # create a new message object
    created_message, created_receivers = message_business. \
        add_message(sender,
                    message_type,
                    receivers,
                    user,
                    **kwargs)
    if created_message:
        logger_service.emit_notification(created_message, created_receivers)
        return created_message
    else:
        raise RuntimeError('Cannot create the new message')


def read_message(user_ID, receiver_id):
    user = UserBusiness.get_by_user_ID(user_ID)
    user_id = user.id
    # 用户点击未读信息后，将信息状态更改为已读
    message_business.read_message(user_id, receiver_id)
