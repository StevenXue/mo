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

from server3.lib import toolkit_orig, preprocess_orig
from server3.entity.toolkit import Toolkit
from server3.repository.toolkit_repo import ToolkitRepo
from server3.business import user_business, ownership_business

toolkit_repo = ToolkitRepo(Toolkit)


def get_by_toolkit_name(toolkit_name):
    # toolkit_obj = Toolkit(name=toolkit_name)
    # print 'toolkit_obj', toolkit_obj.name
    # return toolkit_repo.read_by_toolkit_name(toolkit_obj)
    return toolkit_repo.read_by_unique_field('name', toolkit_name)


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


def remove(toolkit_obj):
    toolkit_repo.delete_by_id(toolkit_obj.id)


def create_public_toolkit():
    """
    数据库建一个toolkit的collection, 记载public的数据分析工具包简介
    """
    user = user_business.get_by_user_ID('system')

    AVG = Toolkit(name='平均值',
                  description='计算所选数据集合的平均值',
                  category=4,
                  result_form=1,
                  entry_function='toolkit_average',
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_average),
                  parameter_spec={
                      "data": {
                          'name': 'input',
                          'type': {
                              'key': 'select_box',
                              'des': 'nD tensor with shape: (batch_size, ..., '
                                     'input_dim). The most common situation would be a '
                                     '2D input with shape (batch_size, input_dim).',
                              'range': None
                          },
                          'default': None,
                          'required': True,
                          'len_range': [1, 1],
                          'data_type': ['int', 'float']
                      }
                  })
    AVG = toolkit_repo.create(AVG)
    ownership_business.add(user, False, toolkit=AVG)

    MEDIAN = Toolkit(name='中位数',
                     description='计算所选数据集合的中位数',
                     category=4,
                     result_form=1,
                     entry_function='toolkit_median',
                     target_py_code=inspect.getsource(toolkit_orig.toolkit_median),
                     parameter_spec={
                         "data": {
                             'name': 'input',
                             'type': {
                                 'key': 'select_box',
                                 'des': 'nD tensor with shape: (batch_size, ..., '
                                        'input_dim). The most common situation would be a '
                                        '2D input with shape (batch_size, input_dim).',
                                 'range': None
                             },
                             'default': None,
                             'required': True,
                             'len_range': [1, 1],
                             'data_type': ['int', 'float']
                         }
                     })
    MEDIAN = toolkit_repo.create(MEDIAN)
    ownership_business.add(user, False, toolkit=MEDIAN)

    MODE = Toolkit(name='众数',
                   description='计算所选数据集合的众数',
                   category=4,
                   result_form=1,
                   entry_function='toolkit_mode',
                   target_py_code=inspect.getsource(toolkit_orig.toolkit_mode),
                   parameter_spec={
                       "data": {
                           'name': 'input',
                           'type': {
                               'key': 'select_box',
                               'des': 'nD tensor with shape: (batch_size, ..., '
                                      'input_dim). The most common situation would be a '
                                      '2D input with shape (batch_size, input_dim).',
                               'range': None
                           },
                           'default': None,
                           'required': True,
                           'len_range': [1, 1],
                           'data_type': ['int', 'float']
                       }
                   })
    MODE = toolkit_repo.create(MODE)
    ownership_business.add(user, False, toolkit=MODE)

    SMA = Toolkit(name='移动平均值',
                  description='计算所选数据集合的移动平均值',
                  category=4,
                  result_form=3,
                  entry_function='toolkit_moving_average',
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_moving_average),
                  parameter_spec={
                      "data": {
                          'name': 'input',
                          'type': {
                              'key': 'select_box',
                              'des': 'nD tensor with shape: (batch_size, ..., '
                                     'input_dim). The most common situation would be a '
                                     '2D input with shape (batch_size, input_dim).',
                              'range': None
                          },
                          'default': None,
                          'required': True,
                          'len_range': [1, 1],
                          'data_type': ['int', 'float']
                      },
                      "args": [
                          {
                              'name': 'window',
                              'type': {
                                  'key': 'int',
                                  'des': 'the window of moving average',
                                  'range': [2, None]
                              },
                              'default': 3,
                              'required': True
                          }
                      ]
                  })
    SMA = toolkit_repo.create(SMA)
    ownership_business.add(user, False, toolkit=SMA)

    RANGE = Toolkit(name='全距',
                    description='计算所选数据集合的最大/最小值之差',
                    category=4,
                    result_form=1,
                    entry_function='toolkit_range',
                    target_py_code=inspect.getsource(toolkit_orig.toolkit_range),
                    parameter_spec={
                        "data": {
                            'name': 'input',
                            'type': {
                                'key': 'select_box',
                                'des': 'nD tensor with shape: (batch_size, ..., '
                                       'input_dim). The most common situation would be a '
                                       '2D input with shape (batch_size, input_dim).',
                                'range': None
                            },
                            'default': None,
                            'required': True,
                            'len_range': [1, 1],
                            'data_type': ['int', 'float']
                        }
                    })
    RANGE = toolkit_repo.create(RANGE)
    ownership_business.add(user, False, toolkit=RANGE)

    STD = Toolkit(name='标准差',
                  description='计算所选数据集合的标准差',
                  category=4,
                  result_form=1,
                  entry_function='toolkit_std',
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_std),
                  parameter_spec={
                      "data": {
                          'name': 'input',
                          'type': {
                              'key': 'select_box',
                              'des': 'nD tensor with shape: (batch_size, ..., '
                                     'input_dim). The most common situation would be a '
                                     '2D input with shape (batch_size, input_dim).',
                              'range': None
                          },
                          'default': None,
                          'required': True,
                          'len_range': [1, 1],
                          'data_type': ['int', 'float']
                      }
                  })
    STD = toolkit_repo.create(STD)
    ownership_business.add(user, False, toolkit=STD)

    VAR = Toolkit(name='方差',
                  description='计算所选数据集合的方差',
                  category=4,
                  result_form=1,
                  entry_function='toolkit_variance',
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_variance),
                  parameter_spec={
                      "data": {
                          'name': 'input',
                          'type': {
                              'key': 'select_box',
                              'des': 'nD tensor with shape: (batch_size, ..., '
                                     'input_dim). The most common situation would be a '
                                     '2D input with shape (batch_size, input_dim).',
                              'range': None
                          },
                          'default': None,
                          'required': True,
                          'len_range': [1, 1],
                          'data_type': ['int', 'float']
                      }
                  })
    VAR = toolkit_repo.create(VAR)
    ownership_business.add(user, False, toolkit=VAR)

    # Result_orm 重新设计
    PEARSON = Toolkit(name='皮尔森相关系数',
                      description='计算所选数据集合的皮尔森相关系数, 表达两变量之间(线性)相关系数',
                      category=4,
                      result_form=1,
                      entry_function='toolkit_pearson',
                      target_py_code=inspect.getsource(toolkit_orig.toolkit_pearson),
                      parameter_spec={
                          "data": {
                              'name': 'input',
                              'type': {
                                  'key': 'select_box',
                                  'des': 'nD tensor with shape: (batch_size, ..., '
                                         'input_dim). The most common situation would be a '
                                         '2D input with shape (batch_size, input_dim).',
                                  'range': None
                              },
                              'default': None,
                              'required': True,
                              'len_range': [2, 2],
                              'data_type': ['int', 'float']
                          }
                      })
    PEARSON = toolkit_repo.create(PEARSON)
    ownership_business.add(user, False, toolkit=PEARSON)

    KMEAN = Toolkit(name='K平均数算法',
                    description='计算所选数据集合的k-mean, 把一个把数据空间划分为k个子集',
                    category=0,
                    entry_function='k_mean',
                    target_py_code=inspect.getsource(toolkit_orig.k_mean),
                    parameter_spec={
                        "data": {
                            'name': 'input',
                            'type': {
                                'key': 'select_box',
                                'des': 'nD tensor with shape: (batch_size, ..., '
                                       'input_dim). The most common situation would be a '
                                       '2D input with shape (batch_size, input_dim).',
                                'range': None
                            },
                            'default': None,
                            'required': True,
                            'len_range': [1, None],
                            'data_type': ['int', 'float']
                        },
                        "args": [
                            {
                                'name': 'k',
                                'type': {
                                    'key': 'int',
                                    'des': 'the number of clustering numbers',
                                    'range': [2, None]
                                },
                                'default': 2,
                                'required': True
                            }
                        ]
                    },
                    result_spec={
                        "if_reserved": True,
                        "args": [
                            {
                                "name": "Clustering Label",
                                "des": "原始数据的每一行元素，对应分类的分类标签",
                                # "type": "list",
                                # 在存列的时候，要记得传进来的时候验证是不是list
                                "if_add_column": True,
                                "attribute": "label",
                                "usage": ["pie", "scatter"]
                            },
                            {
                                "name": "Number of Clusters",
                                "des": "聚类的数量",
                                "if_add_column": False,
                                "attribute": "general_info"
                            },
                            {
                                "name": "Centroids of Clusters",
                                "des": "每个类的中心点",
                                "if_add_column": False,
                                "attribute": "position",
                                "usage": ["scatter"]
                            },
                            {
                                "name": "SSE",
                                "des": "每个到其中心点的距离之和",
                                "if_add_column": False,
                                "attribute": "general_info"
                            }
                        ]
                    })
    KMEAN = toolkit_repo.create(KMEAN)
    ownership_business.add(user, False, toolkit=KMEAN)

    PCA = Toolkit(name='降维PCA-主成分分析算法',
                  description='计算所选数据集合(多为数据)的降维，default自动降维，输入k可降到k维',
                  category=3,
                  result_form=2,
                  entry_function='dimension_reduction_PCA',
                  target_py_code=inspect.getsource(toolkit_orig.dimension_reduction_PCA),
                  parameter_spec={
                      "data": {
                          'name': 'input',
                          'type': {
                              'key': 'select_box',
                              'des': 'nD tensor with shape: (batch_size, ..., '
                                     'input_dim). The most common situation would be a '
                                     '2D input with shape (batch_size, input_dim).',
                              'range': None
                          },
                          'default': None,
                          'required': True,
                          'len_range': [2, None],
                          'data_type': ['int', 'float']
                      },
                      "args": [
                          {
                              'name': 'n_components',
                              'type': {
                                  'key': 'int',
                                  'des': 'the number of clustering numbers',
                                  'range': [1, None]
                              },
                              'default': 2,
                              'required': True
                          }
                      ]
                  })
    PCA = toolkit_repo.create(PCA)
    ownership_business.add(user, False, toolkit=PCA)

    TSNE = Toolkit(name='降维TSNE-t_分布邻域嵌入算法',
                   description='计算所选数据集合(多维数据)的降维，default自动降维，输入k可降到k维，通常为了方便可视化，降至2维',
                   category=3,
                   result_form=2,
                   entry_function='dimension_reduction_TSNE',
                   target_py_code=inspect.getsource(toolkit_orig.dimension_reduction_TSNE),
                   parameter_spec={
                       "data": {
                           'name': 'input',
                           'type': {
                               'key': 'select_box',
                               'des': 'nD tensor with shape: (batch_size, ..., '
                                      'input_dim). The most common situation would be a '
                                      '2D input with shape (batch_size, input_dim).',
                               'range': None
                           },
                           'default': None,
                           'required': True,
                           'len_range': [2, None],
                           'data_type': ['int', 'float']
                       },
                       "args": [
                           {
                               'name': 'n_components',
                               'type': {
                                   'key': 'int',
                                   'des': 'the number of clustering numbers',
                                   'range': [1, None]
                               },
                               'default': 2,
                               'required': True
                           }
                       ]
                   })
    TSNE = toolkit_repo.create(TSNE)
    ownership_business.add(user, False, toolkit=TSNE)

    N = Toolkit(name='数据量',
                description='返回数据个数',
                category=4,
                result_form=1,
                entry_function='toolkit_n',
                target_py_code=inspect.getsource(toolkit_orig.toolkit_n),
                parameter_spec={
                    "data": {
                        'name': 'input',
                        'type': {
                            'key': 'select_box',
                            'des': 'nD tensor with shape: (batch_size, ..., '
                                   'input_dim). The most common situation would be a '
                                   '2D input with shape (batch_size, input_dim).',
                            'range': None
                        },
                        'default': None,
                        'required': True,
                        'len_range': [1, 1],
                        'data_type': ['int', 'float']
                    }
                })
    N = toolkit_repo.create(N)
    ownership_business.add(user, False, toolkit=N)

    IQR = Toolkit(name='IQR',
                  description='数据列的IQR',
                  category=4,
                  result_form=1,
                  entry_function='toolkit_IQR',
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_IQR),
                  parameter_spec={
                      "data": {
                          'name': 'input',
                          'type': {
                              'key': 'select_box',
                              'des': 'nD tensor with shape: (batch_size, ..., '
                                     'input_dim). The most common situation would be a '
                                     '2D input with shape (batch_size, input_dim).',
                              'range': None
                          },
                          'default': None,
                          'required': True,
                          'len_range': [1, 1],
                          'data_type': ['int', 'float']
                      }
                  })
    IQR = toolkit_repo.create(IQR)
    ownership_business.add(user, False, toolkit=IQR)

    CV = Toolkit(name='变异系数',
                 description='返回数据变异系数',
                 category=4,
                 result_form=1,
                 entry_function='toolkit_cv',
                 target_py_code=inspect.getsource(toolkit_orig.toolkit_cv),
                 parameter_spec={
                     "data": {
                         'name': 'input',
                         'type': {
                             'key': 'select_box',
                             'des': 'nD tensor with shape: (batch_size, ..., '
                                    'input_dim). The most common situation would be a '
                                    '2D input with shape (batch_size, input_dim).',
                             'range': None
                         },
                         'default': None,
                         'required': True,
                         'len_range': [1, 1],
                         'data_type': ['int', 'float']
                     }
                 })
    CV = toolkit_repo.create(CV)
    ownership_business.add(user, False, toolkit=CV)

    MAX = Toolkit(name='最大值',
                  description='返回数据最大值',
                  category=4,
                  result_form=1,
                  entry_function='toolkit_max',
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_max),
                  parameter_spec={
                      "data": {
                          'name': 'input',
                          'type': {
                              'key': 'select_box',
                              'des': 'nD tensor with shape: (batch_size, ..., '
                                     'input_dim). The most common situation would be a '
                                     '2D input with shape (batch_size, input_dim).',
                              'range': None
                          },
                          'default': None,
                          'required': True,
                          'len_range': [1, 1],
                          'data_type': ['int', 'float']
                      }
                  })
    MAX = toolkit_repo.create(MAX)
    ownership_business.add(user, False, toolkit=MAX)

    MIN = Toolkit(name='最小值',
                  description='返回数据最小值',
                  category=4,
                  result_form=1,
                  entry_function='toolkit_min',
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_min),
                  parameter_spec={
                      "data": {
                          'name': 'input',
                          'type': {
                              'key': 'select_box',
                              'des': 'nD tensor with shape: (batch_size, ..., '
                                     'input_dim). The most common situation would be a '
                                     '2D input with shape (batch_size, input_dim).',
                              'range': None
                          },
                          'default': None,
                          'required': True,
                          'len_range': [1, 1],
                          'data_type': ['int', 'float']
                      }
                  })
    MIN = toolkit_repo.create(MIN)
    ownership_business.add(user, False, toolkit=MIN)

    # Z_SCORE = Toolkit(name='z_分数',
    #                   description='返回数据z_score',
    #                   category="描述性统计",
    #                   result_form=1,
    #                   entry_function='toolkit_z_score',
    #                   target_py_code=inspect.getsource(toolkit_orig.toolkit_z_score),
    #                   parameter_spec={"input_data": {'type': 'list', 'dimension': 1}})
    # Z_SCORE = toolkit_repo.create(Z_SCORE)
    # ownership_business.add(user, False, toolkit=Z_SCORE)

    # Result_Form 重新设计
    CORRELATION = Toolkit(name='数据互相关',
                          description='返回数据correlation',
                          category=4,
                          result_form=1,
                          entry_function='toolkit_correlation',
                          target_py_code=inspect.getsource(toolkit_orig.toolkit_correlation),
                          parameter_spec={
                              "data": {
                                  'name': 'input',
                                  'type': {
                                      'key': 'select_box',
                                      'des': 'nD tensor with shape: (batch_size, ..., '
                                             'input_dim). The most common situation would be a '
                                             '2D input with shape (batch_size, input_dim).',
                                      'range': None
                                  },
                                  'default': None,
                                  'required': True,
                                  'len_range': [2, 2],
                                  'data_type': ['int', 'float']
                              }
                          })
    CORRELATION = toolkit_repo.create(CORRELATION)
    ownership_business.add(user, False, toolkit=CORRELATION)

    # Result_Form 重新设计
    COV = Toolkit(name='数据协方差',
                  description='返回数据协方差',
                  category=4,
                  result_form=1,
                  entry_function='toolkit_cov',
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_cov),
                  parameter_spec={
                      "data": {
                          'name': 'input',
                          'type': {
                              'key': 'select_box',
                              'des': 'nD tensor with shape: (batch_size, ..., '
                                     'input_dim). The most common situation would be a '
                                     '2D input with shape (batch_size, input_dim).',
                              'range': None
                          },
                          'default': None,
                          'required': True,
                          'len_range': [2, 2],
                          'data_type': ['int', 'float']
                      }
                  })
    COV = toolkit_repo.create(COV)
    ownership_business.add(user, False, toolkit=COV)


def create_public_data_process():
    """
    数据库建一个toolkit的collection, 记载public的数据分析工具包简介
    """
    user = user_business.get_by_user_ID('system')

    standard_scaler = Toolkit(name='无量纲化-正太分布',
                              description='标准化，基于特征矩阵的列，将特征值转换至服从标准正态分布',
                              category=2,
                              entry_function='standard_scaler',
                              target_py_code=inspect.getsource(preprocess_orig.standard_scaler),
                              parameter_spec={
                                  "data": {
                                      'name': 'input',
                                      'type': {
                                          'key': 'select_box',
                                          'des': 'nD tensor with shape: (batch_size, ..., '
                                                 'input_dim). The most common situation would be a '
                                                 '2D input with shape (batch_size, input_dim).',
                                          'range': None
                                      },
                                      'default': None,
                                      'required': True,
                                      'len_range': [1, None],
                                      'data_type': ['int', 'float']
                                  }
                              })
    standard_scaler = toolkit_repo.create(standard_scaler)
    ownership_business.add(user, False, toolkit=standard_scaler)

    min_max_scaler = Toolkit(name='无量纲化-(0, 1)分布',
                             description='区间缩放，基于最大最小值，将特征值转换到[0, 1]区间上',
                             category=2,
                             entry_function='min_max_scaler',
                             target_py_code=inspect.getsource(preprocess_orig.min_max_scaler),
                             parameter_spec={
                                 "data": {
                                     'name': 'input',
                                     'type': {
                                         'key': 'select_box',
                                         'des': 'nD tensor with shape: (batch_size, ..., '
                                                'input_dim). The most common situation would be a '
                                                '2D input with shape (batch_size, input_dim).',
                                         'range': None
                                     },
                                     'default': None,
                                     'required': True,
                                     'len_range': [1, None],
                                     'data_type': ['int', 'float']
                                 }
                             })
    min_max_scaler = toolkit_repo.create(min_max_scaler)
    ownership_business.add(user, False, toolkit=min_max_scaler)

    normalizer = Toolkit(name='归一化',
                         description='基于特征矩阵的行，将样本向量转换为"单位向量"',
                         category=2,
                         entry_function='normalizer',
                         target_py_code=inspect.getsource(preprocess_orig.normalizer),
                         parameter_spec={
                             "data": {
                                 'name': 'input',
                                 'type': {
                                     'key': 'select_box',
                                     'des': 'nD tensor with shape: (batch_size, ..., '
                                            'input_dim). The most common situation would be a '
                                            '2D input with shape (batch_size, input_dim).',
                                     'range': None
                                 },
                                 'default': None,
                                 'required': True,
                                 'len_range': [1, None],
                                 'data_type': ['int', 'float']
                             }
                         })
    normalizer = toolkit_repo.create(normalizer)
    ownership_business.add(user, False, toolkit=normalizer)

    binarizer = Toolkit(name='二值化',
                        description='基于给定阈值，将定量特征按阈值划分',
                        category=2,
                        entry_function='binarizer',
                        target_py_code=inspect.getsource(preprocess_orig.binarizer),
                        parameter_spec={
                            "data": {
                                'name': 'input',
                                'type': {
                                    'key': 'select_box',
                                    'des': 'nD tensor with shape: (batch_size, ..., '
                                           'input_dim). The most common situation would be a '
                                           '2D input with shape (batch_size, input_dim).',
                                    'range': None
                                },
                                'default': None,
                                'required': True,
                                'len_range': [1, 1],
                                'data_type': ['int', 'float']
                            },
                            "args": [
                                {
                                    'name': 'threshold',
                                    'type': {
                                        'key': 'float',
                                        'des': 'the threshold to judge if positive of negative',
                                        'range': [None, None]
                                    },
                                    'default': 0,
                                    'required': True
                                }
                            ]
                        })
    binarizer = toolkit_repo.create(binarizer)
    ownership_business.add(user, False, toolkit=binarizer)

    one_hot_encoder = Toolkit(name='哑编码',
                              description='将定性数据编码为定量数据',
                              category=2,
                              entry_function='one_hot_encoder',
                              target_py_code=inspect.getsource(preprocess_orig.one_hot_encoder),
                              parameter_spec={
                                  "data": {
                                      'name': 'input',
                                      'type': {
                                          'key': 'select_box',
                                          'des': 'nD tensor with shape: (batch_size, ..., '
                                                 'input_dim). The most common situation would be a '
                                                 '2D input with shape (batch_size, input_dim).',
                                          'range': None
                                      },
                                      'default': None,
                                      'required': True,
                                      'len_range': [1, 1],
                                      'data_type': ['int', 'float']
                                  }
                              })
    one_hot_encoder = toolkit_repo.create(one_hot_encoder)
    ownership_business.add(user, False, toolkit=one_hot_encoder)

    imputer = Toolkit(name='缺失值计算',
                      description='计算缺失值，缺失值可填充为均值等',
                      category=2,
                      entry_function='imputer',
                      target_py_code=inspect.getsource(preprocess_orig.imputer),
                      parameter_spec={
                          "data": {
                              'name': 'input',
                              'type': {
                                  'key': 'select_box',
                                  'des': 'nD tensor with shape: (batch_size, ..., '
                                         'input_dim). The most common situation would be a '
                                         '2D input with shape (batch_size, input_dim).',
                                  'range': None
                              },
                              'default': None,
                              'required': True,
                              'len_range': [1, None],
                              'data_type': ['int', 'float']
                          }
                      })
    imputer = toolkit_repo.create(imputer)
    ownership_business.add(user, False, toolkit=imputer)

    polynomial_features = Toolkit(name='多项式数据转换',
                                  description='多项式数据转换, 默认为两次',
                                  category=2,
                                  entry_function='polynomial_features',
                                  target_py_code=inspect.getsource(preprocess_orig.polynomial_features),
                                  parameter_spec={
                                      "data": {
                                          'name': 'input',
                                          'type': {
                                              'key': 'select_box',
                                              'des': 'nD tensor with shape: (batch_size, ..., '
                                                     'input_dim). The most common situation would be a '
                                                     '2D input with shape (batch_size, input_dim).',
                                              'range': None
                                          },
                                          'default': None,
                                          'required': True,
                                          'len_range': [1, None],
                                          'data_type': ['int', 'float']
                                      }
                                  })
    polynomial_features = toolkit_repo.create(polynomial_features)
    ownership_business.add(user, False, toolkit=polynomial_features)

    variance_threshold = Toolkit(name='方差选择法',
                                 description='选取合适的特征，方差选择法',
                                 category=1,
                                 entry_function='variance_threshold',
                                 target_py_code=inspect.getsource(preprocess_orig.variance_threshold),
                                 parameter_spec={
                                     "data": {
                                         'name': 'input',
                                         'type': {
                                             'key': 'select_box',
                                             'des': 'nD tensor with shape: (batch_size, ..., '
                                                    'input_dim). The most common situation would be a '
                                                    '2D input with shape (batch_size, input_dim).',
                                             'range': None
                                         },
                                         'default': None,
                                         'required': True,
                                         'len_range': [1, None],
                                         'data_type': ['int', 'float']
                                     },
                                     "args": [
                                         {
                                             'name': 'threshold',
                                             'type': {
                                                 'key': 'float',
                                                 'des': 'the threshold to judge if positive of negative',
                                                 'range': [0, None]
                                             },
                                             'default': 1,
                                             'required': True
                                         }
                                     ]
                                 },
                                 result_spec={
                                     "if_reserved": True,
                                     "args": [
                                         {
                                             "name": "scores",
                                             "des": "每类特征得到的评分估算",
                                             "if_add_column": False,
                                             "attribute": "value",
                                             "usage": ["bar"]
                                         },
                                         {
                                             "name": "index",
                                             "des": "每类特征是否取用的标签",
                                             "if_add_column": False,
                                             "attribute": "label",
                                             "usage": ["bar", "table"]
                                         },
                                         {
                                             "name": "result",
                                             "des": "筛选出的所有特征值",
                                             "if_add_column": False,
                                             "attribute": "value",
                                         }
                                     ]
                                 })
    variance_threshold = toolkit_repo.create(variance_threshold)
    ownership_business.add(user, False, toolkit=variance_threshold)

    select_k_best_chi2 = Toolkit(name='卡方选择法',
                                 description='选择K个最好的特征，返回选择特征后的数据',
                                 category=1,
                                 entry_function='select_k_best_chi2',
                                 target_py_code=inspect.getsource(preprocess_orig.select_k_best_chi2),
                                 parameter_spec={
                                     "data": {
                                         'name': 'input',
                                         'type': {
                                             'key': 'transfer_box',
                                             'des': 'nD tensor with shape: (batch_size, ..., '
                                                    'input_dim). The most common situation would be a '
                                                    '2D input with shape (batch_size, input_dim).',
                                             'range': None
                                         },
                                         'default': None,
                                         'required': True,
                                         'x_len_range': [2, None],
                                         'y_len_range': [1, 1],

                                         'x_data_type': ['int', 'float'],
                                         'y_data_type': ['int', 'float']
                                     },
                                     "args": [
                                         {
                                             'name': 'n_features',
                                             'type': {
                                                 'key': 'int',
                                                 'des': 'the threshold to judge if positive of negative',
                                                 'range': [1, None]
                                             },
                                             'default': 2,
                                             'required': True
                                         }
                                     ]
                                 },
                                 result_spec={
                                     "if_reserved": True,
                                     "args": [
                                         {
                                             "name": "scores",
                                             "des": "每类特征得到的评分估算",
                                             "if_add_column": False,
                                             "attribute": "value",
                                             "usage": ["bar"]
                                         },
                                         {
                                             "name": "index",
                                             "des": "每类特征是否取用的标签",
                                             "if_add_column": False,
                                             "attribute": "label",
                                             "usage": ["bar", "table"]
                                         },
                                         {
                                             "name": "result",
                                             "des": "筛选出的所有特征值",
                                             "if_add_column": False,
                                             "attribute": "value",
                                         }
                                     ]
                                 })
    select_k_best_chi2 = toolkit_repo.create(select_k_best_chi2)
    ownership_business.add(user, False, toolkit=select_k_best_chi2)

    select_k_best_pearson = Toolkit(name='相关系数选择法',
                                    description='选择K个最好的特征，返回选择特征后的数据',
                                    category=1,
                                    entry_function='select_k_best_pearson',
                                    target_py_code=inspect.getsource(preprocess_orig.select_k_best_pearson),
                                    parameter_spec={
                                        "data": {
                                            'name': 'input',
                                            'type': {
                                                'key': 'transfer_box',
                                                'des': 'nD tensor with shape: (batch_size, ..., '
                                                       'input_dim). The most common situation would be a '
                                                       '2D input with shape (batch_size, input_dim).',
                                                'range': None
                                            },
                                            'default': None,
                                            'required': True,
                                            'x_len_range': [2, None],
                                            'y_len_range': [1, 1],

                                            'x_data_type': ['int', 'float'],
                                            'y_data_type': ['int', 'float']
                                        },
                                        "args": [
                                            {
                                                'name': 'n_features',
                                                'type': {
                                                    'key': 'int',
                                                    'des': 'the threshold to judge if positive of negative',
                                                    'range': [1, None]
                                                },
                                                'default': 2,
                                                'required': True
                                            }
                                        ]
                                    },
                                    result_spec={
                                        "if_reserved": True,
                                        "args": [
                                            {
                                                "name": "scores",
                                                "des": "每类特征得到的评分估算",
                                                "if_add_column": False,
                                                "attribute": "value",
                                                "usage": ["bar"]
                                            },
                                            {
                                                "name": "index",
                                                "des": "每类特征是否取用的标签",
                                                "if_add_column": False,
                                                "attribute": "label",
                                                "usage": ["bar", "table"]
                                            },
                                            {
                                                "name": "result",
                                                "des": "筛选出的所有特征值",
                                                "if_add_column": False,
                                                "attribute": "value",
                                            }
                                        ]
                                    })
    select_k_best_pearson = toolkit_repo.create(select_k_best_pearson)
    ownership_business.add(user, False, toolkit=select_k_best_pearson)

    select_k_best_mic = Toolkit(name='互信息选择法',
                                description='选择K个最好的特征，返回选择特征后的数据',
                                category=1,
                                entry_function='select_k_best_mic',
                                target_py_code=inspect.getsource(preprocess_orig.select_k_best_mic),
                                parameter_spec={
                                    "data": {
                                        'name': 'input',
                                        'type': {
                                            'key': 'transfer_box',
                                            'des': 'nD tensor with shape: (batch_size, ..., '
                                                   'input_dim). The most common situation would be a '
                                                   '2D input with shape (batch_size, input_dim).',
                                            'range': None
                                        },
                                        'default': None,
                                        'required': True,
                                        'x_len_range': [2, None],
                                        'y_len_range': [1, 1],

                                        'x_data_type': ['int', 'float'],
                                        'y_data_type': ['int', 'float']
                                    },
                                    "args": [
                                        {
                                            'name': 'n_features',
                                            'type': {
                                                'key': 'int',
                                                'des': 'the threshold to judge if positive of negative',
                                                'range': [1, None]
                                            },
                                            'default': 2,
                                            'required': True
                                        }
                                    ]
                                },
                                result_spec={
                                    "if_reserved": True,
                                    "args": [
                                        {
                                            "name": "scores",
                                            "des": "每类特征得到的评分估算",
                                            "if_add_column": False,
                                            "attribute": "value",
                                            "usage": ["bar"]
                                        },
                                        {
                                            "name": "index",
                                            "des": "每类特征是否取用的标签",
                                            "if_add_column": False,
                                            "attribute": "label",
                                            "usage": ["bar", "table"]
                                        },
                                        {
                                            "name": "result",
                                            "des": "筛选出的所有特征值",
                                            "if_add_column": False,
                                            "attribute": "value",
                                        }
                                    ]
                                })
    select_k_best_mic = toolkit_repo.create(select_k_best_mic)
    ownership_business.add(user, False, toolkit=select_k_best_mic)

    REF = Toolkit(name='递归特征消除法',
                  description='递归特征消除法, 返回特征选择后的数据, 参数estimator为基模型',
                  category=1,
                  entry_function='ref',
                  target_py_code=inspect.getsource(preprocess_orig.ref),
                  parameter_spec={
                      "data": {
                          'name': 'input',
                          'type': {
                              'key': 'transfer_box',
                              'des': 'nD tensor with shape: (batch_size, ..., '
                                     'input_dim). The most common situation would be a '
                                     '2D input with shape (batch_size, input_dim).',
                              'range': None
                          },
                          'default': None,
                          'required': True,
                          'x_len_range': [2, None],
                          'y_len_range': [1, 1],

                          'x_data_type': ['int', 'float'],
                          'y_data_type': ['int', 'float']
                      },
                      "args": [
                          {
                              'name': 'n_features',
                              'type': {
                                  'key': 'int',
                                  'des': 'the threshold to judge if positive of negative',
                                  'range': [1, None]
                              },
                              'default': 2,
                              'required': True
                          }
                      ]
                  },
                  result_spec={
                      "if_reserved": True,
                      "args": [
                          {
                              "name": "scores",
                              "des": "每类特征得到的评分估算",
                              "if_add_column": False,
                              "attribute": "value",
                              "usage": ["bar"]
                          },
                          {
                              "name": "index",
                              "des": "每类特征是否取用的标签",
                              "if_add_column": False,
                              "attribute": "label",
                              "usage": ["bar", "table"]
                          },
                          {
                              "name": "result",
                              "des": "筛选出的所有特征值",
                              "if_add_column": False,
                              "attribute": "value",
                          }
                      ]
                  })
    REF = toolkit_repo.create(REF)
    ownership_business.add(user, False, toolkit=REF)

    select_from_model_lr = Toolkit(name='基于惩罚项的特征选择法',
                                   description='带L1惩罚项的逻辑回归作为基模型的特征选择, 属于带惩罚的基模型，除了筛选出特征，同时也降维',
                                   category=1,
                                   entry_function='select_from_model_lr',
                                   target_py_code=inspect.getsource(preprocess_orig.select_from_model_lr),
                                   parameter_spec={
                                       "data": {
                                           'name': 'input',
                                           'type': {
                                               'key': 'transfer_box',
                                               'des': 'nD tensor with shape: (batch_size, ..., '
                                                      'input_dim). The most common situation would be a '
                                                      '2D input with shape (batch_size, input_dim).',
                                               'range': None
                                           },
                                           'default': None,
                                           'required': True,
                                           'x_len_range': [2, None],
                                           'y_len_range': [1, 1],

                                           'x_data_type': ['int', 'float'],
                                           'y_data_type': ['int', 'float']
                                       },
                                       "args": [
                                           {
                                               'name': 'threshold',
                                               'type': {
                                                   'key': 'float',
                                                   'des': 'the threshold to judge if positive of negative',
                                                   'range': [0, None]
                                               },
                                               'default': 1,
                                               'required': True
                                           }
                                       ]
                                   },
                                   result_spec={
                                       "if_reserved": True,
                                       "args": [
                                           {
                                               "name": "scores",
                                               "des": "每类特征得到的评分估算",
                                               "if_add_column": False,
                                               "attribute": "value",
                                               "usage": ["bar"]
                                           },
                                           {
                                               "name": "index",
                                               "des": "每类特征是否取用的标签",
                                               "if_add_column": False,
                                               "attribute": "label",
                                               "usage": ["bar", "table"]
                                           },
                                           {
                                               "name": "result",
                                               "des": "筛选出的所有特征值",
                                               "if_add_column": False,
                                               "attribute": "value",
                                           }
                                       ]
                                   })
    select_from_model_lr = toolkit_repo.create(select_from_model_lr)
    ownership_business.add(user, False, toolkit=select_from_model_lr)

    select_from_model_gbdt = Toolkit(name='基于树模型的特征选择法',
                                     description='基树模型中GBDT可用来作为基模型进行特征选择',
                                     category=1,
                                     entry_function='select_from_model_gbdt',
                                     target_py_code=inspect.getsource(preprocess_orig.select_from_model_gbdt),
                                     parameter_spec={
                                         "data": {
                                             'name': 'input',
                                             'type': {
                                                 'key': 'transfer_box',
                                                 'des': 'nD tensor with shape: (batch_size, ..., '
                                                        'input_dim). The most common situation would be a '
                                                        '2D input with shape (batch_size, input_dim).',
                                                 'range': None
                                             },
                                             'default': None,
                                             'required': True,
                                             'x_len_range': [2, None],
                                             'y_len_range': [1, 1],

                                             'x_data_type': ['int', 'float'],
                                             'y_data_type': ['int', 'float']
                                         },
                                         "args": [
                                             {
                                                 'name': 'n_features',
                                                 'type': {
                                                     'key': 'int',
                                                     'des': 'the threshold to judge if positive of negative',
                                                     'range': [1, None]
                                                 },
                                                 'default': 2,
                                                 'required': True
                                             }
                                         ]
                                     },
                                     result_spec={
                                         "if_reserved": True,
                                         "args": [
                                             {
                                                 "name": "scores",
                                                 "des": "每类特征得到的评分估算",
                                                 "if_add_column": False,
                                                 "attribute": "value",
                                                 "usage": ["bar"]
                                             },
                                             {
                                                 "name": "index",
                                                 "des": "每类特征是否取用的标签",
                                                 "if_add_column": False,
                                                 "attribute": "label",
                                                 "usage": ["bar", "table"]
                                             },
                                             {
                                                 "name": "result",
                                                 "des": "筛选出的所有特征值",
                                                 "if_add_column": False,
                                                 "attribute": "value",
                                             }
                                         ]
                                     })
    select_from_model_gbdt = toolkit_repo.create(select_from_model_gbdt)
    ownership_business.add(user, False, toolkit=select_from_model_gbdt)

    decomposition_pca = Toolkit(name='降维-PCA(sk-learn)',
                                description='主成分分析法，返回降维后的数据',
                                category=3,
                                entry_function='decomposition_pca',
                                target_py_code=inspect.getsource(preprocess_orig.decomposition_pca),
                                parameter_spec={
                                    "data": {
                                        'name': 'input',
                                        'type': {
                                            'key': 'select_box',
                                            'des': 'nD tensor with shape: (batch_size, ..., '
                                                   'input_dim). The most common situation would be a '
                                                   '2D input with shape (batch_size, input_dim).',
                                            'range': None
                                        },
                                        'default': None,
                                        'required': True,
                                        'len_range': [2, None],
                                        'data_type': ['int', 'float']
                                    },
                                    "args": [
                                        {
                                            'name': 'n_features',
                                            'type': {
                                                'key': 'int',
                                                'des': 'the threshold to judge if positive of negative',
                                                'range': [1, None]
                                            },
                                            'default': 2,
                                            'required': True
                                        }
                                    ]
                                })
    decomposition_pca = toolkit_repo.create(decomposition_pca)
    ownership_business.add(user, False, toolkit=decomposition_pca)

    lda = Toolkit(name='线性判别分析法（LDA）',
                  description='线性判别分析法，返回降维后的数据，参数n_components为降维后的维数',
                  category=3,
                  entry_function='lda',
                  target_py_code=inspect.getsource(preprocess_orig.lda),
                  parameter_spec={
                      "data": {
                          'name': 'input',
                          'type': {
                              'key': 'transfer_box',
                              'des': 'nD tensor with shape: (batch_size, ..., '
                                     'input_dim). The most common situation would be a '
                                     '2D input with shape (batch_size, input_dim).',
                              'range': None
                          },
                          'default': None,
                          'required': True,
                          'x_len_range': [2, None],
                          'y_len_range': [1, 1],

                          'x_data_type': ['int', 'float'],
                          'y_data_type': ['int', 'float']
                      },
                      "args": [
                          {
                              'name': 'n_components',
                              'type': {
                                  'key': 'int',
                                  'des': 'the number of clusters',
                                  'range': [1, None]
                              },
                              'default': 2,
                              'required': True
                          }
                      ]
                  })
    lda = toolkit_repo.create(lda)
    ownership_business.add(user, False, toolkit=lda)


def update_one_public_toolkit():
    """
        数据库建一个toolkit的collection, 记载public的数据分析工具包简介
    """
    user = user_business.get_by_user_ID('system')
    # Result_Form 重新设计
    MIC = Toolkit(name='最大互信息数',
                  description='计算所选数据集合的最大互信息数, 表达第一个所选值域与其他值域变量之间的相关系数',
                  category=4,
                  result_form=1,
                  entry_function='toolkit_mic',
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_mic),
                  parameter_spec={
                      "data": {
                          'name': 'input',
                          'type': {
                              'key': 'select_box',
                              'des': 'nD tensor with shape: (batch_size, ..., '
                                     'input_dim). The most common situation would be a '
                                     '2D input with shape (batch_size, input_dim).',
                              'range': None
                          },
                          'default': None,
                          'required': True,
                          'len_range': [2, None],
                          'data_type': ['int', 'float']
                      }
                  })
    MIC = toolkit_repo.create(MIC)
    ownership_business.add(user, False, toolkit=MIC)


def remove_one_public_toolkit():
    # user = user_business.get_by_user_ID('system')
    toolkit = get_by_toolkit_name('最大互信息数')
    remove(toolkit)
    # 已舍去
    # ownership_business.remove_ownership_by_user_and_owned_item(user, toolkit, 'toolkit')

if __name__ == '__main__':
    pass
