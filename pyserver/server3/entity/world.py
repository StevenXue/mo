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


class CHANNEL:
    chat = "chat"
    request = "request"
    api = "api"
    module = "module"

    project = "project"


class World(DynamicDocument):
    message_type = StringField(default=MessageType.admin)
    sender = ReferenceField("User")
    channel = StringField(default=CHANNEL.chat)
    message = StringField()

