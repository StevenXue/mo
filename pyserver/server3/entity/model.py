#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-06-09 14:00pm
# @function : Getting all of the Model of Machine Learning
# @running  : python
# Further to FIXME of None
"""

from mongoengine import DynamicDocument
from mongoengine import StringField
from mongoengine import IntField
from mongoengine import DictField
from mongoengine import ListField

MODEL_TYPE = (
    (0, 'nn'),
    (1, 'supervised'),
    (2, 'unsupervised'),
    (3, 'half_supervised'),
    (4, 'folder_input'),
    (5, 'hyperas')
)


class Model(DynamicDocument):
    name = StringField(max_length=50, required=True)
    description = StringField(max_length=140, required=True)
    target_py_code = StringField(required=True)     # 显示路径
    entry_function = StringField(required=True)
    to_code_function = StringField(required=True)
    category = IntField(required=True, choices=MODEL_TYPE)
    parameter_spec = DictField(required=True)
    input = DictField(required=True)
    # usage = IntField(choices=RESUlt_TYPE, required=True)    # 类型，用作何用途
    # classification = IntField(choices=RESUlt_TYPE1, required=True)  # model分类
    # input_data = DictField(required=True)
    # cnn_level = IntField(required=True)     # CNN 层数
    # optimization_algorithm = ListField(IntField(choices=RESUlt_TYPE2))     # 优化方法
    # evaluate_matrix = ListField(IntField(choices=RESUlt_TYPE3), required=True)      # 测量方法
