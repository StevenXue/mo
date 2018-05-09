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

from mongoengine import DynamicDocument
from mongoengine import EmbeddedDocument
from mongoengine import EmbeddedDocumentField
from mongoengine import EmbeddedDocumentListField
from mongoengine import ReferenceField
from mongoengine import ListField
from mongoengine import IntField
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import DictField
from mongoengine import CASCADE
from mongoengine import NULLIFY


class Log(EmbeddedDocument):
    log_type = StringField(choices=('stdout', 'stderr'))
    message = StringField()
    timestamp = DateTimeField()


class RunningModule(EmbeddedDocument):
    module = ReferenceField('Module')
    version = StringField()


class Job(DynamicDocument):
    app = ReferenceField('App')  # belong to which app
    module = ReferenceField('Module')  # belong to which module
    dataset = ReferenceField('Dataset')  # belong to which dataset

    source_file_path = StringField()  # which ipynb file path running this job
    run_args = DictField()  # input args or kwargs
    status = StringField(choices=('running', 'success', 'error', 'terminated'), required=True)
    running_module = EmbeddedDocumentField(RunningModule)   # if running a module, which module
    running_code = StringField()  # if running a piece of code, the code string
    create_time = DateTimeField()
    updated_time = DateTimeField()
    user = ReferenceField('User')
    logs = EmbeddedDocumentListField(Log)




