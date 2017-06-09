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

# import pandas as pd
# import numpy as np
# from sklearn.cluster import KMeans
# from minepy import MINE

from bson import ObjectId

# from lib import model_orig
from entity.model import Model
from repository.model_repo import ModelRepo
from business import user_business, ownership_business

model_repo = ModelRepo(Model)


def get_by_model_name(model_name):
    model_obj = Model(name=model_name)
    return model_repo.read_by_model_name(model_obj)


def get_by_model_id(model_obj):
    return model_repo.read_by_id(model_obj)


def add(name, description, usage, classification, input_data,
        target_py_code, cnn_level, optimization_algorithm, evaluate_matrix):
    model = Model(name=name, description=description, usage=usage, input_data=input_data,
                  classification=classification, target_py_code=target_py_code, cnn_level=cnn_level,
                  evaluate_matrix=evaluate_matrix, optimization_algorithm=optimization_algorithm)
    user = user_business.get_by_user_ID('system')
    ownership_business.add(user, False, model=model)
    return model_repo.create(model)

#
# def create_public_model():
#     """
#     数据库建一个model的collection, 记载public的数据分析工具包简介
#     """
#     user = user_business.get_by_user_ID('system')
#
#     AVG = Toolkit(name='平均值',
#                   description='计算所选数据集合的平均值',
#                   entry_function='model_average',
#                   target_py_code=inspect.getsource(model_orig.model_average),
#                   parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
#     AVG = model_repo.create(AVG)
#     ownership_business.add(user, False, model=AVG)
#
#     MEDIAN = Toolkit(name='中位数',
#                      description='计算所选数据集合的中位数',
#                      entry_function='model_median',
#                      target_py_code=inspect.getsource(model_orig.model_median),
#                      parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
#     MEDIAN = model_repo.create(MEDIAN)
#     ownership_business.add(user, False, model=MEDIAN)
#
#     MODE = Toolkit(name='众数',
#                    description='计算所选数据集合的众数',
#                    entry_function='model_mode',
#                    target_py_code=inspect.getsource(model_orig.model_mode),
#                    parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
#     MODE = model_repo.create(MODE)
#     ownership_business.add(user, False, model=MODE)
#
#     SMA = Toolkit(name='移动平均值',
#                   description='计算所选数据集合的移动平均值',
#                   entry_function='model_moving_average',
#                   target_py_code=inspect.getsource(model_orig.model_moving_average),
#                   parameter_spec={"input_data": {'type': 'list', 'dimension': 1},
#                                   "k": {'type': 'int', 'default': 3}})
#     SMA = model_repo.create(SMA)
#     ownership_business.add(user, False, model=SMA)
#
#     RANGE = Toolkit(name='全距',
#                     description='计算所选数据集合的最大/最小值之差',
#                     entry_function='model_range',
#                     target_py_code=inspect.getsource(model_orig.model_range),
#                     parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
#     RANGE = model_repo.create(RANGE)
#     ownership_business.add(user, False, model=RANGE)
#
#     STD = Toolkit(name='标准差',
#                   description='计算所选数据集合的标准差',
#                   entry_function='model_std',
#                   target_py_code=inspect.getsource(model_orig.model_std),
#                   parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
#     STD = model_repo.create(STD)
#     ownership_business.add(user, False, model=STD)
#
#     VAR = Toolkit(name='方差',
#                   description='计算所选数据集合的方差',
#                   entry_function='model_variance',
#                   target_py_code=inspect.getsource(model_orig.model_variance),
#                   parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
#     VAR = model_repo.create(VAR)
#     ownership_business.add(user, False, model=VAR)
#
#     PEARSON = Toolkit(name='皮尔森相关系数',
#                       description='计算所选数据集合的皮尔森相关系数, 表达两变量之间(线性)相关系数',
#                       entry_function='model_pearson',
#                       target_py_code=inspect.getsource(model_orig.model_pearson),
#                       parameter_spec={"input_data": {'type': 'list', 'dimension': 2}})
#     PEARSON = model_repo.create(PEARSON)
#     ownership_business.add(user, False, model=PEARSON)
#
#     KMEAN = Toolkit(name='K平均数算法',
#                     description='计算所选数据集合的k-mean, 把一个把数据空间划分为k个子集',
#                     entry_function='k_mean',
#                     target_py_code=inspect.getsource(model_orig.k_mean),
#                     parameter_spec={"input_data": {'type': 'list', 'dimension': None},
#                                     "k": {'type': 'int', 'default': 2}})
#     KMEAN = model_repo.create(KMEAN)
#     ownership_business.add(user, False, model=KMEAN)
#
#     PCA = Toolkit(name='降维PCA-主成分分析算法',
#                   description='计算所选数据集合(多为数据)的降维，default自动降维，输入k可降到k维',
#                   entry_function='dimension_reduction_PCA',
#                   target_py_code=inspect.getsource(model_orig.dimension_reduction_PCA),
#                   parameter_spec={"input_data": {'type': 'list', 'dimension': None},
#                                   "k": {'type': 'int', 'default': 1}})
#     PCA = model_repo.create(PCA)
#     ownership_business.add(user, False, model=PCA)
#
#     TSNE = Toolkit(name='降维TSNE-t_分布邻域嵌入算法',
#                    description='计算所选数据集合(多维数据)的降维，default自动降维，输入k可降到k维，通常为了方便可视化，降至2维',
#                    entry_function='dimension_reduction_TSNE',
#                    target_py_code=inspect.getsource(model_orig.dimension_reduction_TSNE),
#                    parameter_spec={"input_data": {'type': 'list', 'dimension': None},
#                                    "k": {'type': 'int', 'default': 2}})
#     TSNE = model_repo.create(TSNE)
#     ownership_business.add(user, False, model=TSNE)
#
#     N = Toolkit(name='数据量',
#                 description='返回数据个数',
#                 entry_function='model_n',
#                 target_py_code=inspect.getsource(model_orig.model_n),
#                 parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
#     N = model_repo.create(N)
#     ownership_business.add(user, False, model=N)
#
#     IQR = Toolkit(name='IQR',
#                   description='数据列的IQR',
#                   entry_function='model_IQR',
#                   target_py_code=inspect.getsource(model_orig.model_IQR),
#                   parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
#     IQR = model_repo.create(IQR)
#     ownership_business.add(user, False, model=IQR)
#
#     CV = Toolkit(name='变异系数',
#                  description='返回数据变异系数',
#                  entry_function='model_cv',
#                  target_py_code=inspect.getsource(model_orig.model_cv),
#                  parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
#     CV = model_repo.create(CV)
#     ownership_business.add(user, False, model=CV)
#
#     MAX = Toolkit(name='最大值',
#                   description='返回数据最大值',
#                   entry_function='model_max',
#                   target_py_code=inspect.getsource(model_orig.model_max),
#                   parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
#     MAX = model_repo.create(MAX)
#     ownership_business.add(user, False, model=MAX)
#
#     MIN = Toolkit(name='最小值',
#                   description='返回数据最小值',
#                   entry_function='model_min',
#                   target_py_code=inspect.getsource(model_orig.model_min),
#                   parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
#     MIN = model_repo.create(MIN)
#     ownership_business.add(user, False, model=MIN)
#
#     Z_SCORE = Toolkit(name='z_分数',
#                       description='返回数据z_score',
#                       entry_function='model_z_score',
#                       target_py_code=inspect.getsource(model_orig.model_z_score),
#                       parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
#     Z_SCORE = model_repo.create(Z_SCORE)
#     ownership_business.add(user, False, model=Z_SCORE)
#
#     CORRELATION = Toolkit(name='数据互相关',
#                           description='返回数据correlation',
#                           entry_function='model_correlation',
#                           target_py_code=inspect.getsource(model_orig.model_correlation),
#                           parameter_spec={"input_data": {'type': 'list', 'dimension': 2}})
#     CORRELATION = model_repo.create(CORRELATION)
#     ownership_business.add(user, False, model=CORRELATION)
#
#     COV = Toolkit(name='数据协方差',
#                   description='返回数据协方差',
#                   entry_function='model_cov',
#                   target_py_code=inspect.getsource(model_orig.model_cov),
#                   parameter_spec={"input_data": {'type': 'list', 'dimension': 2}})
#     COV = model_repo.create(COV)
#     ownership_business.add(user, False, model=COV)
#
#
# def update_one_public_model():
#     """
#         数据库建一个model的collection, 记载public的数据分析工具包简介
#     """
#     user = user_business.get_by_user_ID('system')
#
#     MIC = Toolkit(name='最大互信息数',
#                   description='计算所选数据集合的最大互信息数, 表达第一个所选值域与其他值域变量之间的相关系数',
#                   entry_function='model_mic',
#                   target_py_code=inspect.getsource(model_orig.model_mic),
#                   parameter_spec={"input_data": {'type': 'list', 'dimension': None}})
#     MIC = model_repo.create(MIC)
#     ownership_business.add(user, False, model=MIC)


if __name__ == '__main__':
    pass
