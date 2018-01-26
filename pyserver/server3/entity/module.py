#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Zhaofengli
# @version  : 1.0
# @date     : 2017-12-21 14:00pm
# @function : Module Database Model
# @running  : python
"""

from mongoengine import DynamicDocument
from mongoengine import StringField
from mongoengine import IntField
from mongoengine import DictField
from mongoengine import ListField
from mongoengine import DateTimeField
from mongoengine import ReferenceField

# type for
MODEL_TYPE = (
    (0, 'neural_network'),
    (1, 'custom_supervised'),  # model write with tf custom estimator
    (2, 'unsupervised'),
    (3, 'semi_supervised'),  # none
    (4, 'unstructured'),  # input with directory path
    (5, 'hyperas'),
    (6, 'advanced'),  # eg, style transfer
    (7, 'hyperopt')
)

TYPE = (
    (0, 'regression'),
    (1, 'classification'),
    (2, 'clustering'),
    (3, 'reinforcement_learning')
)

PUBLISH_TYPE = (
    (0, 'no published'),
    (1, 'published')
)


class Module(DynamicDocument):
    # required
    name = StringField(max_length=50, required=True)
    module_path = StringField(required=True)
    user = ReferenceField("User", required=True)

    # option
    language = StringField()
    tags = ListField(StringField())
    create_time = DateTimeField()
    submit_time = DateTimeField()
    description = StringField(max_length=140)
    doc = StringField()
    publish = IntField(required=True, choices=MODEL_TYPE, default=0)

    # alogorithmia
    # tagline
    # desciption (doc)
    # sample input


    # entry_function = StringField(required=True)
    # to_code_function = StringField(required=True)
    # category = IntField(required=True, choices=MODEL_TYPE)
    # model_type = IntField(required=True, choices=TYPE)
    # parameter_spec = DictField(required=True)
    # steps = ListField(DictField())
    # input = DictField(required=True)
    # user_name = StringField(max_length=50)


