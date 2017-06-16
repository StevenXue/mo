# -*- coding: UTF-8 -*-

from mongoengine import *


class File(Document):
    name = StringField(max_length=50, required=True)
    upload_time = DateTimeField(required=True)
    url = StringField(required=True)
    uri = StringField(unique=True, required=True)
    size = IntField()
    description = StringField(max_length=140)

