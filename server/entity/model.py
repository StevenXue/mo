# -*- coding: UTF-8 -*-

from mongoengine import *

RESUlt_TYPE = (
    (0, 'Regression')
)


# TODO Need to be confirmed
class Model(Document):
    name = StringField(max_length=50)
    # description = StringField(max_length=140)
    # # 类型，用作何用途
    # usage= IntField(choices=RESUlt_TYPE)
    # input={
    #     'shape': {
    #         'seq':0,
    #         'length':20,
    #
    #     }，
    #     'ranks'
    #     'type'
    # }
    # evaluate_matrix = # cross entropy loss or more
