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
from mongoengine import BooleanField
from mongoengine import DateTimeField


INPUT_TYPES = ('image', '1darray', '2darray', 'ndarray')
STATUS = ('running', 'stopped', 'terminated')


class ServedModel(DynamicDocument):
    name = StringField(max_length=50, required=True)
    description = StringField(required=True)
    input_info = StringField(required=True)
    output_info = StringField(required=True)
    examples = StringField(required=True)
    version = IntField(required=True)
    server = StringField(required=True)
    input_type = StringField(required=True, choices=INPUT_TYPES)
    model_base_path = StringField(required=True)
    deploy_name = StringField(required=True)
    job = ReferenceField('Job', required=True)
    status = StringField(choices=STATUS)
    user_name = StringField()
    related_fields = ListField()
    tags = ListField()
    related_tasks = ListField()
    private = BooleanField(required=True)
    data_fields = ListField()
    input_data_demo_string = StringField()
    create_time = DateTimeField(required=True)
    user = ReferenceField('User', required=True)
    user_ID = StringField()
    projectId = StringField()

