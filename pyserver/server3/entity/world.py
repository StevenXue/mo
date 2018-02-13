# -*- coding: UTF-8 -*-
from mongoengine import DynamicDocument
from mongoengine import StringField
from mongoengine import IntField
from mongoengine import DictField
from mongoengine import ListField
from mongoengine import ReferenceField


class MessageType:
    admin = "admin"
    user = "user"


class Channel:
    chat = "chat"
    request = "request"
    api = "api"
    module = "module"


class World(DynamicDocument):
    message_type = StringField(default=MessageType.admin)
    sender = ReferenceField("User")
    channel = StringField(default=Channel.chat)
    message = StringField()

