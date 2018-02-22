#!/usr/bin/python
# -*- coding: UTF-8 -*-

from datetime import datetime

from server3.entity.message import Message
from server3.entity.message import Receiver
from server3.repository.message_repo import MessageRepo, ReceiverRepo
from server3.utility import json_utility
from bson import ObjectId
message_repo = MessageRepo(Message)
receiver_repo = ReceiverRepo(Receiver)


def get_by_user_id(user_id):

    receivers = receiver_repo.read_by_unique_field('obj_id', ObjectId(user_id))
    message = [receiver.message for receiver in receivers]
    return message


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
    return user_request_repo.delete_by_id(user_request_id)
