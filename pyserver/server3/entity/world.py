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
    # 用户还是系统发送
    message_type = StringField(default=MessageType.admin)
    # 发送者
    sender = ReferenceField("User")
    # 频道
    channel = StringField(default=CHANNEL.chat)
    # 发送内容
    message = StringField()


    # # 用于拼接发送内容的信息
    # # 动作
    # action_type = StringField()
    # # 实例
    # entity_type = StringField()
    # # 名称
    # entity_title = StringField()


