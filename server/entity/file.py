# -*- coding: UTF-8 -*-

from mongoengine import *


class File(Document):
    name = StringField(max_length=50, required=True)
    description = StringField(max_length=140)
    upload_time = DateTimeField(required=True)
    size = IntField()
    url = StringField(required=True)
    # TODO path to uri
    path = StringField(unique=True, required=True)
    # user = ReferenceField('User')

