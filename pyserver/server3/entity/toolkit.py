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
from mongoengine import IntField
from mongoengine import ListField

# RESUlT_FORM = (
#     (0, 'Direct Show',
#      1, 'Add New Staging Data as well as adding New Column',
#      2, 'Add New Staging Data without adding New Column')
# )

CATEGORY_FORM = (
    (0, '聚类',
     1, '特征选取')
)


class Toolkit(DynamicDocument):
    """
    This is the document for Toolkit server3.entity:
        list of variables and its type on below
    """

    # object_id = StringField(max_length=20, unique=True)
    name = StringField(max_length=50, unique=True, required=True)
    description = StringField(max_length=140)
    # input_data = ListField()
    category = StringField(required=True)

    # TODO 已经转移到result_type里了
    # result_form = IntField(required=True, choices=RESUlT_FORM)

    # target_py = StringField(max_length=25, unique=True)
    target_py_code = StringField(required=True)

    # ownership_ref = StringField(max_length=20, unique=True)
    # ownership_ref = ReferenceField('Ownership')

    # status = DictField()
    # status = IntField(choices=STATUS, required=True)
    fields = ListField()
    tags = ListField()
    entry_function = StringField(required=True)

    parameter_spec = DictField()
    result_spec = DictField()
