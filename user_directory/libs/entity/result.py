#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-24 11:00pm
# @function : Getting all of the result of statics analysis
# @running  : python
# Further to FIXME of None
"""

from mongoengine import Document
from mongoengine import ReferenceField
from mongoengine import DateTimeField
from mongoengine import StringField
from mongoengine import DynamicField
from mongoengine import IntField

from ..entity.job import Job


RESULT_TYPE = (
    (0, 'analysis of toolkit',
     1, 'training result',
     2, 'testing result')
)


class Result(Document):
    job = ReferenceField(Job, required=True)
    create_time = DateTimeField(required=True)
    description = StringField(max_length=140)
    result = DynamicField()
    result_type = IntField(choices=RESULT_TYPE)
