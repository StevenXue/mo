# -*- coding: UTF-8 -*-
from mongoengine import DynamicDocument
from mongoengine import StringField
from mongoengine import IntField
from mongoengine import DictField
from mongoengine import ListField
from mongoengine import ReferenceField

RE_TYPE = (
    (0, 'disabled'),
    (1, 'active')
)


class Api(DynamicDocument):
    name = StringField(max_length=50)
    # api对应的网址尾缀如: /api/xxx/xxxx
    url = StringField(max_length=50, required=True)
    # 此条api对应的关键词匹配
    keyword = StringField(max_length=30, unique=True, required=True)
    # api目的描述
    description = StringField(max_length=50, required=True)
    # http_req是get还是post
    http_req = StringField(required=True)
    # 输入格式 url的额外信息 如body,parameters
    input = DictField()
    # 输出格式
    output = DictField()
    # api status
    status = IntField(choices=RE_TYPE)
    # 模拟的数据
    fake_response = StringField()
    # 收藏这条api的用户
    favor_users = ListField(ReferenceField("User"))
    # 点赞这条api的用户
    star_users = ListField(ReferenceField("User"))
