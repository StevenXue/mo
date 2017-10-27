#!/usr/local/bin/python3
# -*- coding: UTF-8 -*-
"""
# @author   : Zhaofeng Li
# @version  : 1.0
# @date     : 2017-08-22
# @running  : python
"""
from mongoengine import DynamicDocument
from mongoengine import StringField
from mongoengine import IntField
from mongoengine import DictField
from mongoengine import ReferenceField
from mongoengine import ListField

INPUT_TYPES = ('image', '1darray', '2darray', 'ndarray')
STATUS = ('running', 'stopped', 'terminated')


class ServedModel(DynamicDocument):
    name = StringField(max_length=50, required=True)
    description = StringField(max_length=140, required=True)
    input_info = StringField(required=True),
    output_info = StringField(required=True),
    examples = StringField(required=True)
    version = IntField(required=True)
    server = StringField(required=True)
    input_type = StringField(required=True, choices=INPUT_TYPES)
    model_base_path = StringField(required=True)
    deploy_name = StringField(required=True)
    job = ReferenceField('Job', required=True)
    status = StringField(choices=STATUS)
    user_name = StringField()
    related_field = StringField(max_length=100)
    tags = ListField(StringField(max_length=50))
    related_tasks = StringField(max_length=50)
