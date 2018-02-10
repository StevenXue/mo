# -*- coding: UTF-8 -*-
from mongoengine import Document
from mongoengine import StringField
from mongoengine import EmailField
from mongoengine import IntField
from mongoengine import ListField
from mongoengine import ReferenceField
GENDER = (
    (0, 'female'),
    (1, 'male')
)


class User(Document):
    user_ID = StringField(max_length=20, unique=True, required=True)
    password = StringField(required=True)
    name = StringField(max_length=50)
    email = EmailField(unique=True)
    phone = StringField(unique=True)
    gender = IntField(choices=GENDER)
    age = IntField()
    # 用户收藏的api列表
    favor_apis = ListField(ReferenceField("Api"))
    # 用户点赞的api列表
    star_apis = ListField(ReferenceField("Api"))
