#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 11:00pm
# @function : Getting all of the toolkit of statics analysis
# @running  : python
# Further to FIXME of None
"""

# import numpy as np
import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from minepy import MINE

from bson import ObjectId
import inspect

from lib import *
from entity.toolkit import Toolkit
from repository.toolkit_repo import ToolkitRepo
from business import user_business, ownership_business

toolkit_repo = ToolkitRepo(Toolkit)


def get_by_toolkit_name(toolkit_name):
    toolkit_obj = Toolkit(name=toolkit_name)
    # print 'toolkit_obj', toolkit_obj.name
    return toolkit_repo.read_by_toolkit_name(toolkit_obj)


def get_by_toolkit_id(toolkit_id):
    toolkit_obj = Toolkit(id=ObjectId(toolkit_id))
    # print 'toolkit_obj', toolkit_obj.name
    return toolkit_repo.read_by_id(toolkit_obj)


def list_public_toolkit_name():
    # toolkit_obj = Toolkit()
    all_names = []
    # print 'toolkit_obj', toolkit_obj.name
    for tool in get_all_public_toolkit():
        all_names.append(tool.toolkit.name)
    return all_names


# TODO 涉及到别的 entity 或者 business 放到 service 里 to tianyi by zhaofeng
def get_all_public_toolkit():
    return ownership_business.list_ownership_by_type_and_private('toolkit', False)


def add(name, description, target_py_code, entry_function, parameter_spec):
    toolkit = Toolkit(name=name, description=description,
                      target_py_code=target_py_code,
                      entry_function=entry_function,
                      parameter_spec=parameter_spec)
    # TODO add ownership
    return toolkit_repo.create(toolkit)


def create_public_toolkit():
    """
    数据库建一个toolkit的collection, 记载public的数据分析工具包简介
    """
    user = user_business.get_by_user_ID('system') # fixme

    AVG = Toolkit(name='平均值',
                  description='计算所选数据集合的平均值',
                  entry_function='run',
                  # target_py_code=inspect.getsource(lib.toolkit_average),
                  parameter_spec={"input_data": [{'type': 'list'}]})
    AVG = toolkit_repo.create(AVG)
    ownership_business.add(user, False, toolkit=AVG)

    MEDIAN = Toolkit(name='中位数',
                     description='计算所选数据集合的中位数',
                     entry_function='run',
                     parameter_spec={"input_data": [{'type': 'list'}]})
    MEDIAN = toolkit_repo.create(MEDIAN)
    ownership_business.add(user, False, toolkit=MEDIAN)

    MODE = Toolkit(name='众数',
                   description='计算所选数据集合的众数',
                   entry_function='run',
                   parameter_spec={"input_data": [{'type': 'list'}]})
    MODE = toolkit_repo.create(MODE)
    ownership_business.add(user, False, toolkit=MODE)

    SMA = Toolkit(name='移动平均值',
                  description='计算所选数据集合的移动平均值',
                  entry_function='run',
                  parameter_spec={"input_data": [{'type': 'list'}],
                                  "k": {'type': 'int', 'default': 2}})
    SMA = toolkit_repo.create(SMA)
    ownership_business.add(user, False, toolkit=SMA)

    RANGE = Toolkit(name='全距',
                    description='计算所选数据集合的最大/最小值之差',
                    entry_function='run',
                    parameter_spec={"input_data": [{'type': 'list'}]})
    RANGE = toolkit_repo.create(RANGE)
    ownership_business.add(user, False, toolkit=RANGE)

    STD = Toolkit(name='标准差',
                  description='计算所选数据集合的标准差',
                  entry_function='run',
                  parameter_spec={"input_data": [{'type': 'list'}]})
    STD = toolkit_repo.create(STD)
    ownership_business.add(user, False, toolkit=STD)

    VAR = Toolkit(name='方差',
                  description='计算所选数据集合的方差',
                  entry_function='run',
                  parameter_spec={"input_data": [{'type': 'list'}]})
    VAR = toolkit_repo.create(VAR)
    ownership_business.add(user, False, toolkit=VAR)

    PEARSON = Toolkit(name='皮尔森相关系数',
                      description='计算所选数据集合的皮尔森相关系数, 表达两变量之间(线性)相关系数',
                      entry_function='run',
                      parameter_spec={"input_data": [{'type': 'list'}, {'type': 'list'}]})
    PEARSON = toolkit_repo.create(PEARSON)
    ownership_business.add(user, False, toolkit=PEARSON)

    KMEAN = Toolkit(name='K平均数算法',
                    description='计算所选数据集合的k-mean, 把一个把数据空间划分为k个子集',
                    entry_function='run',
                    parameter_spec={"input_data": [{'type': 'list'}, {'type': 'list'}],
                                    "k": {'type': 'int', 'default': 2}})
    KMEAN = toolkit_repo.create(KMEAN)
    ownership_business.add(user, False, toolkit=KMEAN)

    MIC = Toolkit(name='最大互信息数',
                  description='计算所选数据集合的最大互信息数, 表达两变量之间(函数关系)相关系数',
                  entry_function='run',
                  parameter_spec={"input_data": [{'type': 'list'}, {'type': 'list'}]})
    MIC = toolkit_repo.create(MIC)
    ownership_business.add(user, False, toolkit=MIC)


# TODO 建议放入 utility to tianyi by zhaofeng
def convert_json_str_to_dataframe(arr):
    """
    convert input data:
    from
        data from staging data => database_type like, which is a list of dicts
    to
        DataFrame in pandas
    """
    col = arr[0].keys()
    df_converted = pd.DataFrame([[i[j] for j in col] for i in arr],columns=col)
    return df_converted

decorater= \
"""

"""

if __name__ == '__main__':
    pass
