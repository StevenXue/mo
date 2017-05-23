# -*- coding: UTF-8 -*-

from mongoengine import *


class Project(Document):
    name = StringField(max_length=20, unique=True, required=True)
    description = StringField(max_length=140)
    data_set = ReferenceField('DataSet')
    jobs = ListField(ReferenceField('Job'))
    result = ReferenceField('Result')
    ownership = ReferenceField('Ownership')
