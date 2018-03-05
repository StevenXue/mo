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
    email = EmailField(unique=True, sparse=True)
    phone = StringField(unique=True, sparse=True)
    gender = IntField(choices=GENDER)
    age = IntField()

    # 用户点赞的request列表
    request_vote_up = ListField(ReferenceField("UserRequest"))
    # 用户star的request列表
    request_star = ListField(ReferenceField("UserRequest"))
    # 用户点赞的answer列表
    answer_vote_up = ListField(ReferenceField("RequestAnswer"))

    # 用户收藏的api列表
    favor_apps = ListField(ReferenceField("App"))
    # 用户点赞的api列表
    star_apps = ListField(ReferenceField("App"))
    # 用户使用过的api列表
    used_apps = ListField(ReferenceField("App"))

    # 用户收藏的module列表
    favor_modules = ListField(ReferenceField("Module"))
    # 用户点赞的module列表
    star_modules = ListField(ReferenceField("Module"))
    # 用户使用过的的module列表
    used_modules = ListField(ReferenceField("Module"))

    # TODO 将数据库内数据删除后删掉
    # 用户收藏的api列表
    favor_apis = ListField(ReferenceField("Api"))
    # 用户点赞的api列表
    star_apis = ListField(ReferenceField("Api"))
    # 用户使用过的api列表
    used_apis = ListField(ReferenceField("Api"))
