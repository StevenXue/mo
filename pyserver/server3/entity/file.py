# -*- coding: UTF-8 -*-

from mongoengine import Document
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import IntField


class File(Document):
    name = StringField(max_length=50, required=True)
    upload_time = DateTimeField(required=True)
    url = StringField(required=True)
    uri = StringField(unique=True, required=True)
    size = IntField()
    description = StringField(max_length=140)

