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

from mongoengine import *

RESULT_TYPE = (
    (0, 'analysis of toolkit')
)


class Result(Document):
    job = ReferenceField('Job', required=True)
    create_time = DateTimeField(required=True)
    description = StringField(max_length=140)
    result = DynamicField()
    result_type = IntField(choices=RESULT_TYPE)
