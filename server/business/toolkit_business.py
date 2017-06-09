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

from bson.objectid import ObjectId
import inspect

from lib import toolkit_file
from entity.toolkit import Toolkit
from repository.toolkit_repo import ToolkitRepo
from business import user_business, ownership_business

toolkit_repo = ToolkitRepo(Toolkit)


def get_by_toolkit_name(toolkit_name):
    toolkit_obj = Toolkit(name=toolkit_name)
    # print 'toolkit_obj', toolkit_obj.name
    return toolkit_repo.read_by_toolkit_name(toolkit_obj)


def get_by_toolkit_id(toolkit_id):
    return toolkit_repo.read_by_id(toolkit_id)


def add(name, description, target_py_code, entry_function, parameter_spec):
    toolkit = Toolkit(name=name, description=description,
                      target_py_code=target_py_code,
                      entry_function=entry_function,
                      parameter_spec=parameter_spec)
    user = user_business.get_by_user_ID('system')
    ownership_business.add(user, False, toolkit=toolkit)
    return toolkit_repo.create(toolkit)


def create_public_toolkit():
    """
    数据库建一个toolkit的collection, 记载public的数据分析工具包简介
    """
    user = user_business.get_by_user_ID('system')

    AVG = Toolkit(name='平均值',
                  description='计算所选数据集合的平均值',
                  entry_function='toolkit_average',
                  target_py_code=inspect.getsource(toolkit_file.toolkit_average),
                  parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
    AVG = toolkit_repo.create(AVG)
    ownership_business.add(user, False, toolkit=AVG)

    MEDIAN = Toolkit(name='中位数',
                     description='计算所选数据集合的中位数',
                     entry_function='toolkit_median',
                     target_py_code=inspect.getsource(toolkit_file.toolkit_median),
                     parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
    MEDIAN = toolkit_repo.create(MEDIAN)
    ownership_business.add(user, False, toolkit=MEDIAN)

    MODE = Toolkit(name='众数',
                   description='计算所选数据集合的众数',
                   entry_function='toolkit_mode',
                   target_py_code=inspect.getsource(toolkit_file.toolkit_mode),
                   parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
    MODE = toolkit_repo.create(MODE)
    ownership_business.add(user, False, toolkit=MODE)

    SMA = Toolkit(name='移动平均值',
                  description='计算所选数据集合的移动平均值',
                  entry_function='toolkit_moving_average',
                  target_py_code=inspect.getsource(toolkit_file.toolkit_moving_average),
                  parameter_spec={"input_data": {'type': 'list', 'dimension': 1},
                                  "k": {'type': 'int', 'default': 3}})
    SMA = toolkit_repo.create(SMA)
    ownership_business.add(user, False, toolkit=SMA)

    RANGE = Toolkit(name='全距',
                    description='计算所选数据集合的最大/最小值之差',
                    entry_function='toolkit_range',
                    target_py_code=inspect.getsource(toolkit_file.toolkit_range),
                    parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
    RANGE = toolkit_repo.create(RANGE)
    ownership_business.add(user, False, toolkit=RANGE)

    STD = Toolkit(name='标准差',
                  description='计算所选数据集合的标准差',
                  entry_function='toolkit_std',
                  target_py_code=inspect.getsource(toolkit_file.toolkit_std),
                  parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
    STD = toolkit_repo.create(STD)
    ownership_business.add(user, False, toolkit=STD)

    VAR = Toolkit(name='方差',
                  description='计算所选数据集合的方差',
                  entry_function='toolkit_variance',
                  target_py_code=inspect.getsource(toolkit_file.toolkit_variance),
                  parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
    VAR = toolkit_repo.create(VAR)
    ownership_business.add(user, False, toolkit=VAR)

    PEARSON = Toolkit(name='皮尔森相关系数',
                      description='计算所选数据集合的皮尔森相关系数, 表达两变量之间(线性)相关系数',
                      entry_function='toolkit_pearson',
                      target_py_code=inspect.getsource(toolkit_file.toolkit_pearson),
                      parameter_spec={"input_data": {'type': 'list', 'dimension': 2}})
    PEARSON = toolkit_repo.create(PEARSON)
    ownership_business.add(user, False, toolkit=PEARSON)

    KMEAN = Toolkit(name='K平均数算法',
                    description='计算所选数据集合的k-mean, 把一个把数据空间划分为k个子集',
                    entry_function='k_mean',
                    target_py_code=inspect.getsource(toolkit_file.k_mean),
                    parameter_spec={"input_data": {'type': 'list', 'dimension': None},
                                    "k": {'type': 'int', 'default': 2}})
    KMEAN = toolkit_repo.create(KMEAN)
    ownership_business.add(user, False, toolkit=KMEAN)

    PCA = Toolkit(name='降维PCA-主成分分析算法',
                  description='计算所选数据集合(多为数据)的降维，default自动降维，输入k可降到k维',
                  entry_function='dimension_reduction_PCA',
                  target_py_code=inspect.getsource(toolkit_file.dimension_reduction_PCA),
                  parameter_spec={"input_data": {'type': 'list', 'dimension': None},
                                  "k": {'type': 'int', 'default': 1}})
    PCA = toolkit_repo.create(PCA)
    ownership_business.add(user, False, toolkit=PCA)

    TSNE = Toolkit(name='降维TSNE-t_分布邻域嵌入算法',
                   description='计算所选数据集合(多维数据)的降维，default自动降维，输入k可降到k维，通常为了方便可视化，降至2维',
                   entry_function='dimension_reduction_TSNE',
                   target_py_code=inspect.getsource(toolkit_file.dimension_reduction_TSNE),
                   parameter_spec={"input_data": {'type': 'list', 'dimension': None},
                                   "k": {'type': 'int', 'default': 2}})
    TSNE = toolkit_repo.create(TSNE)
    ownership_business.add(user, False, toolkit=TSNE)

    N = Toolkit(name='数据量',
                description='返回数据个数',
                entry_function='toolkit_n',
                target_py_code=inspect.getsource(toolkit_orig.toolkit_n),
                parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
    N = toolkit_repo.create(N)
    ownership_business.add(user, False, toolkit=N)

    IQR = Toolkit(name='IQR',
                  description='数据列的IQR',
                  entry_function='toolkit_IQR',
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_IQR),
                  parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
    IQR = toolkit_repo.create(IQR)
    ownership_business.add(user, False, toolkit=IQR)

    CV = Toolkit(name='变异系数',
                 description='返回数据变异系数',
                 entry_function='toolkit_cv',
                 target_py_code=inspect.getsource(toolkit_orig.toolkit_cv),
                 parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
    CV = toolkit_repo.create(CV)
    ownership_business.add(user, False, toolkit=CV)

    MAX = Toolkit(name='最大值',
                  description='返回数据最大值',
                  entry_function='toolkit_max',
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_max),
                  parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
    MAX = toolkit_repo.create(MAX)
    ownership_business.add(user, False, toolkit=MAX)

    MIN = Toolkit(name='最小值',
                  description='返回数据最小值',
                  entry_function='toolkit_min',
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_min),
                  parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
    MIN = toolkit_repo.create(MIN)
    ownership_business.add(user, False, toolkit=MIN)

    Z_SCORE = Toolkit(name='z_分数',
                      description='返回数据z_score',
                      entry_function='toolkit_z_score',
                      target_py_code=inspect.getsource(toolkit_orig.toolkit_z_score),
                      parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
    Z_SCORE = toolkit_repo.create(Z_SCORE)
    ownership_business.add(user, False, toolkit=Z_SCORE)

    CORRELATION = Toolkit(name='数据互相关',
                          description='返回数据correlation',
                          entry_function='toolkit_correlation',
                          target_py_code=inspect.getsource(toolkit_orig.toolkit_correlation),
                          parameter_spec={"input_data": {'type': 'list', 'dimension': 2}})
    CORRELATION = toolkit_repo.create(CORRELATION)
    ownership_business.add(user, False, toolkit=CORRELATION)

    COV = Toolkit(name='数据协方差',
                  description='返回数据协方差',
                  entry_function='toolkit_cov',
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_cov),
                  parameter_spec={"input_data": {'type': 'list', 'dimension': 2}})
    COV = toolkit_repo.create(COV)
    ownership_business.add(user, False, toolkit=COV)


def update_one_public_toolkit():
    """
        数据库建一个toolkit的collection, 记载public的数据分析工具包简介
    """
    user = user_business.get_by_user_ID('system')

    MIC = Toolkit(name='最大互信息数',
                  description='计算所选数据集合的最大互信息数, 表达第一个所选值域与其他值域变量之间的相关系数',
                  entry_function='toolkit_mic',
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_mic),
                  parameter_spec={"input_data": {'type': 'list', 'dimension': None}})
    MIC = toolkit_repo.create(MIC)
    ownership_business.add(user, False, toolkit=MIC)


if __name__ == '__main__':
    pass
