#!/usr/bin/python
# -*- coding: UTF-8 -*-
'''
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 17:00pm
# @function : Getting all of the toolkit of statics analysis
# @running  : python
# Further to FIXME of None
'''

from mongoengine import *


class Toolkit(DynamicDocument):
    """
    This is the document for Toolkit Entity:
        list of variables and its type on below
    """

    # object_id = StringField(max_length=20, unique=True)
    name = StringField(max_length=50, unique=True)
    description = StringField(max_length=100, unique=True)
    # input_data = ListField()

    # target_py = StringField(max_length=25, unique=True)
    target_py = ReferenceField('File')

    # ownership_ref = StringField(max_length=20, unique=True)
    # ownership_ref = ReferenceField('Ownership')

    status = DictField()
    # status = IntField(choices=STATUS, required=True)

    parameter_spec = DictField()
    meta = {'allow_inheritance': True}

    # def __init__(self, name, description, parameter_spec):
    #     self.name = name
    #     self.description = description
    #     # self.input_data = input_data
    #     self.parameter_spec = parameter_spec

if __name__ == '__main__':
    AVG = Toolkit(name='平均值',
                  description='计算所选数据集合的平均值',
                  parameter_spec={'input_data': list})

    MEDIAN = Toolkit(name='中位数',
                     description='计算所选数据集合的中位数',
                     parameter_spec={'input_data': list})

    MODE = Toolkit(name='众数',
                   description='计算所选数据集合的众数',
                   parameter_spec={'input_data': list})

    SMA = Toolkit(name='移动平均值',
                  description='计算所选数据集合的移动平均值',
                  parameter_spec={'input_data': list,
                                  'period': int})

    RANGE = Toolkit(name='全距',
                    description='计算所选数据集合的最大/最小值之差',
                    parameter_spec={'input_data': list})

    STD = Toolkit(name='标准差',
                  description='计算所选数据集合的标准差',
                  parameter_spec={'input_data': list})

    print dir(AVG)
    # aa = list
    # bb = isinstance([1, 2, 3], aa)
    # print bb
