# -*- coding: UTF-8 -*-

from mongoengine import Document
from mongoengine import StringField
from mongoengine import ListField

DATA_SET_TYPE = ('type1', 'type2')


class DataSet(Document):
    name = StringField(max_length=50, unique=True, required=True)
    description = StringField(max_length=140)
    related_field = StringField(max_length=100)
    tags = ListField(StringField(max_length=50))
    related_tasks = StringField(max_length=50)



