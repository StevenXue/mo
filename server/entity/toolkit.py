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
    description = StringField(max_length=100)
    # input_data = ListField()

    # target_py = StringField(max_length=25, unique=True)
    target_py = ReferenceField('File')

    # ownership_ref = StringField(max_length=20, unique=True)
    # ownership_ref = ReferenceField('Ownership')

    status = DictField()
    # status = IntField(choices=STATUS, required=True)

    parameter_spec = DictField()
    # meta = {'allow_inheritance': True}

    # def __init__(self, name, description, parameter_spec):
    #     self.name = name
    #     self.description = description
    #     # self.input_data = input_data
    #     self.parameter_spec = parameter_spec


def save_once():
    """
    数据库建一个toolkit的collection, 记载public的数据分析工具包简介
    """
    AVG = Toolkit(name='平均值',
                  description='计算所选数据集合的平均值',
                  parameter_spec={'input_data': 'list'}).save()

    MEDIAN = Toolkit(name='中位数',
                     description='计算所选数据集合的中位数',
                     parameter_spec={'input_data': 'list'}).save()

    MODE = Toolkit(name='众数',
                   description='计算所选数据集合的众数',
                   parameter_spec={'input_data': 'list'}).save()

    SMA = Toolkit(name='移动平均值',
                  description='计算所选数据集合的移动平均值',
                  parameter_spec={'input_data': 'list',
                                  'period': 'int'}).save()

    RANGE = Toolkit(name='全距',
                    description='计算所选数据集合的最大/最小值之差',
                    parameter_spec={'input_data': 'list'}).save()

    STD = Toolkit(name='标准差',
                  description='计算所选数据集合的标准差',
                  parameter_spec={'input_data': 'list'}).save()

    PEARSON = Toolkit(name='皮尔森相关系数',
                      description='计算所选数据集合的皮尔森相关系数, 表达两变量之间相关系数',
                      parameter_spec={'input_data0': 'list',
                                      'input_data1': 'list'}).save()

    KMEAN = Toolkit(name='K平均数算法',
                    description='计算所选数据集合的k-mean, 把一个把数据空间划分为k个子集',
                    parameter_spec={'input_data': 'list',
                                    'k': 'int'}).save()

# if __name__ == '__main__':
#     # save_once()
#     # print dir(AVG)
#     aa = 'list'
#     aaa = 'int'
#     bb = isinstance([1, 2, 3], eval(aa))
#     bb = isinstance(1, eval(aaa))
#
#     print bb
