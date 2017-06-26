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

from mongoengine import Document
from mongoengine import StringField
from mongoengine import IntField
from mongoengine import DictField
from mongoengine import ListField

RESUlt_TYPE = (
    (0, 'Regression',
     1, 'Classifier')
)

RESUlt_TYPE1 = (
    (0, '监督式学习',
     1, '非监督式学习',
     2, '半监督式学习')
)

RESUlt_TYPE2 = (
    (0, 'Gradient descent',
     1, 'Gradient boosting')
)

RESUlt_TYPE3 = (
    (0, 'accuracy',
     1, 'cross-entropy')
)


class Model(Document):
    name = StringField(max_length=50, required=True)
    description = StringField(max_length=140, required=True)
    usage = IntField(choices=RESUlt_TYPE, required=True)    # 类型，用作何用途
    classification = IntField(choices=RESUlt_TYPE1, required=True)  # model分类
    input_data = DictField(required=True)
    target_py_code = StringField(required=True)     # 显示路径
    cnn_level = IntField(required=True)     # CNN 层数
    optimization_algorithm = ListField(IntField(choices=RESUlt_TYPE2))     # 优化方法
    evaluate_matrix = ListField(IntField(choices=RESUlt_TYPE3), required=True)      # 测量方法

    # input={
    #     'shape': {
    #         'seq':0,
    #         'length':20,
    #
    #     },
    #     'ranks': 3,
    #     'type':
    #     'target_input_addr':
    # }
