#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-24 11:00pm
# @function : Getting all of the job of statics analysis
# @running  : python
# Further to FIXME of None
"""

from mongoengine import *

STATUS = (
    (0, 'start'),
    (1, 'process'),
    (2, 'end')
)


class Job(Document):
    model = ReferenceField('Model')
    toolkit = ReferenceField('ToolKit')
    staging_data_set = ReferenceField('StagingDataSet')
    status = IntField(choices=STATUS, required=True)
