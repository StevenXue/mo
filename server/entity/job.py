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
    (100, 'processing'),
    (200, 'completed'),
    (300, 'interrupted')
)


class Job(Document):
    model = ReferenceField('Model')
    toolkit = ReferenceField('Toolkit')
    # TODO FIXME very bad
    # staging_data_set = ReferenceField('StagingDataSet', required=True)
    staging_data_set = StringField('StagingDataSet')
    status = IntField(choices=STATUS, required=True)
    create_time = DateTimeField(required=True)
    updated_time = DateTimeField()
