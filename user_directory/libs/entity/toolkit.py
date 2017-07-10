#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 17:00pm
# @function : Getting all of the toolkit of statics analysis
# @running  : python
# Further to FIXME of None
"""

from mongoengine import DynamicDocument
from mongoengine import StringField
from mongoengine import DictField


class Toolkit(DynamicDocument):
    """
    This is the document for Toolkit Entity:
        list of variables and its type on below
    """

    # object_id = StringField(max_length=20, unique=True)
    name = StringField(max_length=50, unique=True, required=True)
    description = StringField(max_length=140)
    # input_data = ListField()

    # target_py = StringField(max_length=25, unique=True)
    target_py_code = StringField(required=True)

    # ownership_ref = StringField(max_length=20, unique=True)
    # ownership_ref = ReferenceField('Ownership')

    # status = DictField()
    # status = IntField(choices=STATUS, required=True)

    entry_function = StringField(required=True)
    # 'run'

    parameter_spec = DictField()
