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


class Result(Document):
    job = ReferenceField('Job')
    time = DateTimeField()
    # should be data_set, float or dynamic?
    result = DynamicField()
