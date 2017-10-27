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
     1, '特征选取',
     2, '数值转换',
     3, '降维',
     4, '概率统计推断',
     5, '描述性统计')
)


class Toolkit(DynamicDocument):
    """
    This is the document for Toolkit server3.entity:
        list of variables and its type on below
    """

    name = StringField(max_length=50, unique=True, required=True)
    description = StringField(max_length=140)
    category = IntField(required=True)

    # result_form = IntField(required=True, choices=RESUlT_FORM)
    target_py_code = StringField(required=True)
    fields = ListField()
    tags = ListField()
    entry_function = StringField(required=True)

    parameter_spec = DictField()
    result_spec = DictField()
    user_name = StringField(max_length=50)

    # steps
    steps = ListField(DictField())
    # frontend display category
    front_end_category = StringField(max_length=50)


