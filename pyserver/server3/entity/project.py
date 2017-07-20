# -*- coding: UTF-8 -*-

from mongoengine import Document
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import ReferenceField
from mongoengine import ListField

# from server3.entity import DataSet
# from server3.entity import Job
# from server3.entity import Result


class Project(Document):
    name = StringField(max_length=50, unique=True, required=True)
    description = StringField(max_length=140)
    create_time = DateTimeField(required=True)
    datasets = ListField(ReferenceField('DataSet'))
    jobs = ListField(ReferenceField('Job'))
    results = ListField(ReferenceField('Result'))
