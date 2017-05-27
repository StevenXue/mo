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
    (0, 'Type 1')
)


class Result(Document):
    job = ReferenceField('Job', required=True)
    # TODO Changed "time" to "create_time", Added "description", "result_type"
    # FIXME
    # TODO
    create_time = DateTimeField(required=True)
    description = StringField(max_length=140)
    # should be data_set, float or dynamic?
    result = DynamicField()
    type = IntField(choices=RESULT_TYPE)
