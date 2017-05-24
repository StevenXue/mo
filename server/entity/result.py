# -*- coding: UTF-8 -*-

from mongoengine import *


class Result(Document):
    job = ReferenceField('Job')
    time = DateTimeField()
    # should be data_set, float or dynamic?
    result = FloatField()
