# -*- coding: UTF-8 -*-

from mongoengine import *

from entity.data_set import DataSet
from entity.job import Job
from entity.result import Result


class Project(Document):
    name = StringField(max_length=50, unique=True, required=True)
    description = StringField(max_length=140)
    create_time = DateTimeField(required=True)
    datasets = ListField(ReferenceField(DataSet))
    jobs = ListField(ReferenceField(Job))
    results = ListField(ReferenceField(Result))
