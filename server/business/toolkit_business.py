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
# from bson import ObjectId

from entity.toolkit import Toolkit
from repository.toolkit_repo import ToolkitRepo

toolkit_repo = ToolkitRepo(Toolkit)


def get_by_toolkit_name(toolkit_name):
    toolkit_obj = Toolkit(name=toolkit_name)
    # print 'toolkit_obj', toolkit_obj.name
    return toolkit_repo.read_by_toolkit_name(toolkit_obj)


def get_by_toolkit_id(toolkit_id):
    toolkit_obj = Toolkit(id=toolkit_id)
    # toolkit_obj = Toolkit(_id=ObjectId(toolkit_id))

    # print 'toolkit_obj', toolkit_obj.name
    return toolkit_repo.read_by_id(toolkit_obj)


def list_available_toolkits():
    # toolkit_obj = Toolkit()
    all_names = []
    # print 'toolkit_obj', toolkit_obj.name
    for tool in toolkit_repo.read({}):
        all_names.append(tool.name)
    return all_names


def convert_json_str_to_dataframe(arr):
    """
    convert input data:
    from
        data from staging data => database_type like, which is a list of dicts
    to
        DataFrame in pandas
    """
    col = arr[0].keys()
    df_converted = pd.DataFrame([[i[j] for j in col] for i in arr],
                                columns=col)
    return df_converted


def save_public_toolkit():
    """
    数据库建一个toolkit的collection, 记载public的数据分析工具包简介
    """
    AVG = Toolkit(name='平均值',
                  description='计算所选数据集合的平均值',
                  parameter_spec={'input_data': 'list'})
    toolkit_repo.create(AVG)

    MEDIAN = Toolkit(name='中位数',
                     description='计算所选数据集合的中位数',
                     parameter_spec={'input_data': 'list'})
    toolkit_repo.create(MEDIAN)

    MODE = Toolkit(name='众数',
                   description='计算所选数据集合的众数',
                   parameter_spec={'input_data': 'list'})
    toolkit_repo.create(MODE)

    SMA = Toolkit(name='移动平均值',
                  description='计算所选数据集合的移动平均值',
                  parameter_spec={'input_data': 'list',
                                  'window': 3})
    toolkit_repo.create(SMA)

    RANGE = Toolkit(name='全距',
                    description='计算所选数据集合的最大/最小值之差',
                    parameter_spec={'input_data': 'list'})
    toolkit_repo.create(RANGE)

    STD = Toolkit(name='标准差',
                  description='计算所选数据集合的标准差',
                  parameter_spec={'input_data': 'list'})
    toolkit_repo.create(STD)

    VAR = Toolkit(name='方差',
                  description='计算所选数据集合的方差',
                  parameter_spec={'input_data': 'list'})
    toolkit_repo.create(VAR)

    PEARSON = Toolkit(name='皮尔森相关系数',
                      description='计算所选数据集合的皮尔森相关系数, 表达两变量之间(线性)相关系数',
                      parameter_spec={'input_data0': 'list',
                                      'input_data1': 'list'})
    toolkit_repo.create(PEARSON)

    KMEAN = Toolkit(name='K平均数算法',
                    description='计算所选数据集合的k-mean, 把一个把数据空间划分为k个子集',
                    parameter_spec={'input_data': 'list',
                                    'k': 2})
    toolkit_repo.create(KMEAN)

    MIC = Toolkit(name='最大互信息数',
                  description='计算所选数据集合的最大互信息数, 表达两变量之间(函数关系)相关系数',
                  parameter_spec={'input_data0': 'list',
                                  'input_data1': 'list'})
    toolkit_repo.create(MIC)

# if __name__ == '__main__':
#     # pass
#     DD = [
#         {
#             "lower_band": 237.09999999999994,
#             "timestamp": "2017-05-23 11:20:03",
#             "upper_band": 238.90000000000006,
#             "value": 238
#         },
#         {
#             "lower_band": 238.7,
#             "timestamp": "2017-05-23 11:35:03",
#             "upper_band": 238.7,
#             "value": 238.7
#         },
#         {
#             "lower_band": 237.35000000000008,
#             "timestamp": "2017-05-23 11:50:03",
#             "upper_band": 241.58333333333331,
#             "value": 239.4666666666667
#         },
#         {
#             "lower_band": 238.45,
#             "timestamp": "2017-05-23 12:05:03",
#             "upper_band": 239.3,
#             "value": 238.875
#         },
#         {
#             "lower_band": 238.64583333333331,
#             "timestamp": "2017-05-23 12:20:03",
#             "upper_band": 239.00416666666666,
#             "value": 238.825
#         },
#         {
#             "lower_band": 236.39999999999995,
#             "timestamp": "2017-05-23 12:35:03",
#             "upper_band": 239.60000000000005,
#             "value": 238
#         },
#         {
#             "lower_band": 231.7683333333333,
#             "timestamp": "2017-05-23 12:50:03",
#             "upper_band": 240.46500000000006,
#             "value": 236.11666666666667
#         },
#         {
#             "lower_band": 230.30999999999997,
#             "timestamp": "2017-05-23 13:05:03",
#             "upper_band": 238.09,
#             "value": 234.2
#         },
#         {
#             "lower_band": 230.14500000000004,
#             "timestamp": "2017-05-23 13:20:03",
#             "upper_band": 232.41500000000002,
#             "value": 231.28000000000003
#         },
#         {
#             "lower_band": 228.2166666666667,
#             "timestamp": "2017-05-23 13:35:03",
#             "upper_band": 236.84999999999997,
#             "value": 232.53333333333333
#         },
#         {
#             "lower_band": 231.72,
#             "timestamp": "2017-05-23 13:50:03",
#             "upper_band": 233.63999999999996,
#             "value": 232.67999999999998
#         },
#         {
#             "lower_band": 231.9875,
#             "timestamp": "2017-05-23 14:05:03",
#             "upper_band": 233.0125,
#             "value": 232.5
#         },
#         {
#             "lower_band": 232.9055555555555,
#             "timestamp": "2017-05-23 14:20:03",
#             "upper_band": 233.25,
#             "value": 233.07777777777775
#         },
#         {
#             "lower_band": 233.2333333333333,
#             "timestamp": "2017-05-23 14:35:03",
#             "upper_band": 233.36666666666667,
#             "value": 233.29999999999998
#         },
#         {
#             "lower_band": 233.2920915743495,
#             "timestamp": "2017-05-23 14:50:03",
#             "upper_band": 233.4254249076829,
#             "value": 233.3587582410162
#         },
#         {
#             "lower_band": 233.23982218484252,
#             "timestamp": "2017-05-23 15:05:03",
#             "upper_band": 233.5064888515093,
#             "value": 233.3731555181759
#         },
#         {
#             "lower_band": 233.08788891740735,
#             "timestamp": "2017-05-23 15:20:03",
#             "upper_band": 233.4878889174075,
#             "value": 233.28788891740743
#         },
#         {
#             "lower_band": 233.20276756279935,
#             "timestamp": "2017-05-23 15:35:03",
#             "upper_band": 233.73610089613288,
#             "value": 233.46943422946612
#         },
#         {
#             "lower_band": 233.5304303465454,
#             "timestamp": "2017-05-23 15:50:03",
#             "upper_band": 234.1970970132123,
#             "value": 233.86376367987884
#         }
#     ]

# print (convert_json_str_to_dataframe(DD).mean())
