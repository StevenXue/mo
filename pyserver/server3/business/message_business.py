#!/usr/bin/python
# -*- coding: UTF-8 -*-

from datetime import datetime

from server3.entity.message import Message
from server3.entity.message import Receiver
from server3.repository.message_repo import MessageRepo, ReceiverRepo
from server3.utility import json_utility
from bson import ObjectId
from server3.business import user_business
from server3.business import user_request_business

message_repo = MessageRepo(Message)
receiver_repo = ReceiverRepo(Receiver)


def get_by_user_id(user_id):
    receivers = receiver_repo.read({'obj_id': ObjectId(user_id)})
    receivers = json_utility.convert_to_json([i.to_mongo()
                                              for i in receivers])
    print('receivers')
    print(receivers)
    messages = []
    for receiver in receivers:
        message = message_repo.read_unique_one(
            {'_id': ObjectId(receiver['message'])})
        message_info = message.to_mongo()
        message_info['user_ID'] = message.user.user_ID
        message_info['user_request_title'] = message.user_request.title
        message_info['is_read'] = receiver['is_read']
        message_info['receiver_id'] = receiver['_id']
        messages.append(message_info)
    print('messages')
    messages = json_utility.convert_to_json(messages)
    print(messages)
    return messages


def add_message(sender, message_type, receivers, **kwargs):
    now = datetime.utcnow()

    message_obj = Message(sender=sender,
                          create_time=now,
                          message_type=message_type,
                          **kwargs)
    message = message_repo.create(message_obj)
    for el in receivers:
        receiver_repo.create(Receiver(
            obj_id=el.get('obj_id', None), message=message
        ))
    return message


def remove_by_id(user_request_id):
    pass
    # return user_request_repo.delete_by_id(user_request_id)


def read_message(user_id, receiver_id):
    # todo
    # check 身份
    receiver_repo.update_one_by_id(receiver_id, {'is_read': True})
