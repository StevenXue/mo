# -*- coding: UTF-8 -*-

from mongoengine import *


class Project(Document):
    name = StringField(max_length=20, unique=True, required=True)
    description = StringField(max_length=140)
    create_time = DateTimeField()
    # TODO 命名和其他data_set不统一
    datasets = ListField(ReferenceField('DataSet'))
    jobs = ListField(ReferenceField('Job'))
    results = ListField(ReferenceField('Result'))
