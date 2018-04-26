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


def get_by_user(user_id,page_no=1,page_size=100,):
    start = (page_no - 1) * page_size
    end = page_no * page_size
    receivers = receiver_repo.read({'user': ObjectId(user_id)})



    receivers_info = json_utility.convert_to_json([i.to_mongo()
                                              for i in receivers])
    messages = []
    for receiver in receivers_info:
        message = message_repo.read_unique_one(
            {'_id': ObjectId(receiver['message'])})
        message_info = message.to_mongo()
        message_info['user_ID'] = message.user.user_ID
        if message.user_request:
            message_info['user_request_title'] = message.user_request.title
            message_info['user_request_type'] = message.user_request.type
        message_info['is_read'] = receiver['is_read']
        message_info['receiver_id'] = receiver['_id']
        messages.append(message_info)
    messages = json_utility.convert_to_json(messages)
    return messages


def add_message(sender, message_type, receivers, user, **kwargs):
    now = datetime.utcnow()

    message_obj = Message(sender=sender,
                          create_time=now,
                          message_type=message_type,
                          user=user,
                          **kwargs)
    message = message_repo.create(message_obj)
    created_receivers = []
    print(receivers)
    for el in receivers:
        created_receivers.append(receiver_repo.create(Receiver(
            user=el, message=message
        )))
    return message, created_receivers


def remove_by_id(user_request_id):
    pass
    # return user_request_repo.delete_by_id(user_request)


def read_message(user_id, receiver_id):
    receiver_repo.update_one_by_id(receiver_id, {'is_read': True})


class MessageBusiness:
    project = None
    message_repo = MessageRepo(Message)
    receiver_repo = ReceiverRepo(Receiver)

    @classmethod
    def get_by_user(cls, user, page_no, page_size):
        start = (page_no - 1) * page_size
        end = page_no * page_size
        receivers = cls.receiver_repo.read()
        receivers = receivers(user=user)
        # 该用户的所有信息的数量
        total_number = receivers.count()
        receivers = receivers[start: end]
        receivers_info = json_utility.convert_to_json([i.to_mongo()
                                                       for i in receivers])
        messages = []
        for receiver in receivers_info:
            message = cls.message_repo.read_unique_one(
                {'_id': ObjectId(receiver['message'])})
            message_info = message.to_mongo()
            message_info['user_ID'] = message.user.user_ID
            if message.user_request:
                message_info['user_request_title'] = message.user_request.title
                message_info['user_request_type'] = message.user_request.type
            message_info['is_read'] = receiver['is_read']
            message_info['receiver_id'] = receiver['_id']
            messages.append(message_info)
        messages = json_utility.convert_to_json(messages)
        return messages, total_number


    @classmethod
    def add_message(cls, sender, message_type, receivers, user, **kwargs):
        now = datetime.utcnow()

        message_obj = Message(sender=sender,
                              create_time=now,
                              message_type=message_type,
                              user=user,
                              **kwargs)
        message = cls.message_repo.create(message_obj)
        created_receivers = []
        for el in receivers:
            created_receivers.append(receiver_repo.create(Receiver(
                user=el, message=message
            )))
        return message, created_receivers

    @classmethod
    def remove_by_id(cls, user_request_id):
        pass
        # return user_request_repo.delete_by_id(user_request)

    @classmethod
    def read_message(cls, user, receiver_id):
        receiver_repo.update_one_by_id(receiver_id, {'is_read': True})