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

from server3.constants import SPEC

toolkit_repo = ToolkitRepo(Toolkit)


def get_by_toolkit_name(toolkit_name):
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
                  },
                  result_spec={
                      "if_reserved": False,
                      "args": [
                          {
                              "name": "average",
                              "des": "所选范围的样本的平均值",
                              "if_add_column": False,
                              "attribute": "value"
                          }
                      ]
                  })
    AVG = toolkit_repo.create(AVG)
    ownership_business.add(user, False, toolkit=AVG)

    MEDIAN = Toolkit(name='中位数',
                     description='计算所选数据集合的中位数',
                     category=4,
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
                     },
                     result_spec={
                         "if_reserved": False,
                         "args": [
                             {
                                 "name": "median",
                                 "des": "所选范围的样本的中位数",
                                 "if_add_column": False,
                                 "attribute": "value"
                             }
                         ]
                     })
    MEDIAN = toolkit_repo.create(MEDIAN)
    ownership_business.add(user, False, toolkit=MEDIAN)

    MODE = Toolkit(name='众数',
                   description='计算所选数据集合的众数',
                   category=4,
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
                   },
                   result_spec={
                       "if_reserved": False,
                       "args": [
                           {
                               "name": "mode",
                               "des": "所选范围的样本的众数",
                               "if_add_column": False,
                               "attribute": "value"
                           },
                           {
                               "name": "number",
                               "des": "众数的个数",
                               "if_add_column": False,
                               "attribute": "value"
                           }
                       ]
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
                  },
                  result_spec={
                      "if_reserved": False,
                      "args": [
                          {
                              "name": "simple_moving_average",
                              "des": "所选范围的样本的移动平均值",
                              "if_add_column": False,
                              "attribute": "value"
                          }
                      ]
                  })
    SMA = toolkit_repo.create(SMA)
    ownership_business.add(user, False, toolkit=SMA)

    RANGE = Toolkit(name='全距',
                    description='计算所选数据集合的最大/最小值之差',
                    category=4,
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
                    },
                    result_spec={
                        "if_reserved": False,
                        "args": [
                            {
                                "name": "range",
                                "des": "所选范围的样本的全距(即数据的范围)",
                                "if_add_column": False,
                                "attribute": "value"
                            }
                        ]
                    })
    RANGE = toolkit_repo.create(RANGE)
    ownership_business.add(user, False, toolkit=RANGE)

    STD = Toolkit(name='标准差',
                  description='计算所选数据集合的标准差',
                  category=4,
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
                  },
                  result_spec={
                      "if_reserved": False,
                      "args": [
                          {
                              "name": "std",
                              "des": "所选范围的样本的标准差",
                              "if_add_column": False,
                              "attribute": "value"
                          }
                      ]
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
                  },
                  result_spec={
                      "if_reserved": False,
                      "args": [
                          {
                              "name": "variance",
                              "des": "所选范围的样本的方差",
                              "if_add_column": False,
                              "attribute": "value"
                          }
                      ]
                  })
    VAR = toolkit_repo.create(VAR)
    ownership_business.add(user, False, toolkit=VAR)

    # Result_orm 重新设计
    PEARSON = Toolkit(name='皮尔森相关系数',
                      description='计算所选数据集合的皮尔森相关系数, 表达两变量之间(线性)相关系数',
                      category=4,
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
                      },
                      result_spec={
                          "if_reserved": False,
                          "args": [
                              {
                                  "name": "pearson",
                                  "des": "所选范围的样本的皮尔森相关系数",
                                  "if_add_column": False,
                                  "attribute": "value"
                              }
                          ]
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
                                'name': 'n_clusters',
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
                                "name": "Clustering_Label",
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
                              'default': 'mle',
                              'required': True
                          }
                      ]
                  },
                  result_spec={
                      "if_reserved": True,
                      "args": [
                          {
                              "name": "dimension_reduction_result",
                              "des": "所选范围的样本的降维后的结果",
                              "if_add_column": True,
                              "attribute": "label"
                          },
                          {
                              "name": "components",
                              "des": "所选范围的样本的降维后的结果",
                              "if_add_column": False,
                              "attribute": "value"
                          },
                          {
                              "name": "explained_variance",
                              "des": "所选范围的样本的降维后的结果",
                              "if_add_column": False,
                              "attribute": "bar"
                          },
                          {
                              "name": "explained_variance_ratio_",
                              "des": "所选范围的样本的降维后的结果",
                              "if_add_column": False,
                              "attribute": "pie"
                          },
                          {
                              "name": "mean_",
                              "des": "所选范围的样本的降维后的结果",
                              "if_add_column": False,
                              "attribute": "value"
                          },
                          {
                              "name": "noise_variance",
                              "des": "所选范围的样本的降维后的结果",
                              "if_add_column": False,
                              "attribute": "general_info"
                          }
                      ]
                  })
    PCA = toolkit_repo.create(PCA)
    ownership_business.add(user, False, toolkit=PCA)

    TSNE = Toolkit(name='降维TSNE-t_分布邻域嵌入算法',
                   description='计算所选数据集合(多维数据)的降维，default自动降维，输入k可降到k维，通常为了方便可视化，降至2维',
                   category=3,
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
                   },
                   result_spec={
                       "if_reserved": True,
                       "args": [
                           {
                               "name": "dimension_reduction_result",
                               "des": "所选范围的样本的降维后的结果",
                               "if_add_column": True,
                               "attribute": "label"
                           },
                           {
                               "name": "kl_divergence",
                               "des": "所选范围的样本的降维后的结果",
                               "if_add_column": False,
                               "attribute": "general_info"
                           }
                       ]
                   })
    TSNE = toolkit_repo.create(TSNE)
    ownership_business.add(user, False, toolkit=TSNE)

    N = Toolkit(name='数据量',
                description='返回数据个数',
                category=4,
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
                },
                result_spec={
                    "if_reserved": False,
                    "args": [
                        {
                            "name": "number",
                            "des": "所选范围的样本个数",
                            "if_add_column": False,
                            "attribute": "value"
                        }
                    ]
                })
    N = toolkit_repo.create(N)
    ownership_business.add(user, False, toolkit=N)

    IQR = Toolkit(name='IQR',
                  description='数据列的IQR',
                  category=4,
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
                  },
                  result_spec={
                      "if_reserved": False,
                      "args": [
                          {
                              "name": "IQR_range",
                              "des": "所选范围的样本死分数",
                              "if_add_column": False,
                              "attribute": "value"
                          }
                      ]
                  })
    IQR = toolkit_repo.create(IQR)
    ownership_business.add(user, False, toolkit=IQR)

    CV = Toolkit(name='变异系数',
                 description='返回数据变异系数',
                 category=4,
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
                 },
                 result_spec={
                     "if_reserved": False,
                     "args": [
                         {
                             "name": "cv",
                             "des": "所选范围的样本的变异系数",
                             "if_add_column": False,
                             "attribute": "value"
                         }
                     ]
                 })
    CV = toolkit_repo.create(CV)
    ownership_business.add(user, False, toolkit=CV)

    MAX = Toolkit(name='最大值',
                  description='返回数据最大值',
                  category=4,
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
                  },
                  result_spec={
                      "if_reserved": False,
                      "args": [
                          {
                              "name": "max",
                              "des": "所选范围的样本的最大值",
                              "if_add_column": False,
                              "attribute": "value"
                          }
                      ]
                  })
    MAX = toolkit_repo.create(MAX)
    ownership_business.add(user, False, toolkit=MAX)

    MIN = Toolkit(name='最小值',
                  description='返回数据最小值',
                  category=4,
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
                  },
                  result_spec={
                      "if_reserved": False,
                      "args": [
                          {
                              "name": "min",
                              "des": "所选范围的样本的最小值",
                              "if_add_column": False,
                              "attribute": "value"
                          }
                      ]
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
                          },
                          result_spec={
                              "if_reserved": False,
                              "args": [
                                  {
                                      "name": "correlation",
                                      "des": "所选范围的样本的互相关系数",
                                      "if_add_column": False,
                                      "attribute": "value"
                                  }
                              ]
                          })
    CORRELATION = toolkit_repo.create(CORRELATION)
    ownership_business.add(user, False, toolkit=CORRELATION)

    # Result_Form 重新设计
    COV = Toolkit(name='数据协方差',
                  description='返回数据协方差',
                  category=4,
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
                  },
                  result_spec={
                      "if_reserved": False,
                      "args": [
                          {
                              "name": "cov",
                              "des": "所选范围的样本协方差",
                              "if_add_column": False,
                              "attribute": "value"
                          }
                      ]
                  })
    COV = toolkit_repo.create(COV)
    ownership_business.add(user, False, toolkit=COV)


def create_public_data_process():
    """
    数据库建一个toolkit的collection, 记载public的数据分析工具包简介
    """
    user = user_business.get_by_user_ID('system')

    standard_scaler = Toolkit(name='无量纲化-正态分布',
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
                              },
                              result_spec={
                                  "if_reserved": True,
                                  "args": [
                                      {
                                          "name": "result",
                                          "des": "数值转换，对所选数据做标准化处理",
                                          "if_add_column": True,
                                          "attribute": "label"
                                      }
                                  ]
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
                             },
                             result_spec={
                                 "if_reserved": True,
                                 "args": [
                                     {
                                         "name": "result",
                                         "des": "数值转换，对所选数据做标准化处理",
                                         "if_add_column": True,
                                         "attribute": "label"
                                     }
                                 ]
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
                                 'len_range': [2, None],
                                 'data_type': ['int', 'float']
                             }
                         },
                         result_spec={
                             "if_reserved": True,
                             "args": [
                                 {
                                     "name": "result",
                                     "des": "数值转换，对所选数据做标准化处理",
                                     "if_add_column": True,
                                     "attribute": "label"
                                 }
                             ]
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
                        },
                        result_spec={
                            "if_reserved": True,
                            "args": [
                                {
                                    "name": "result",
                                    "des": "数值转换，对所选数据做标准化处理",
                                    "if_add_column": True,
                                    "attribute": "label"
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
                              },
                              result_spec={
                                  "if_reserved": True,
                                  "args": [
                                      {
                                          "name": "result",
                                          "des": "数值转换，对所选数据做标准化处理",
                                          "if_add_column": True,
                                          "attribute": "label"
                                      }
                                  ]
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
                      },
                      result_spec={
                          "if_reserved": True,
                          "args": [
                              {
                                  "name": "result",
                                  "des": "数值转换，对所选数据做标准化处理",
                                  "if_add_column": True,
                                  "attribute": "label"
                              }
                          ]
                      })
    imputer = toolkit_repo.create(imputer)
    ownership_business.add(user, False, toolkit=imputer)

    polynomial_features = Toolkit(name='多项式数据转换',
                                  description='多项式数据转换, 默认为两次',
                                  category=2,
                                  entry_function='polynomial_features',
                                  target_py_code=inspect.getsource(
                                      preprocess_orig.polynomial_features),
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
                                  },
                                  result_spec={
                                      "if_reserved": True,
                                      "args": [
                                          {
                                              "name": "result",
                                              "des": "数值转换，对所选数据做标准化处理",
                                              "if_add_column": True,
                                              "attribute": "label"
                                          }
                                      ]
                                  })
    polynomial_features = toolkit_repo.create(polynomial_features)
    ownership_business.add(user, False, toolkit=polynomial_features)

    variance_threshold = Toolkit(name='方差选择法',
                                 description='选取合适的特征，方差选择法',
                                 category=1,
                                 entry_function='variance_threshold',
                                 target_py_code=inspect.getsource(
                                     preprocess_orig.variance_threshold),
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
                                             "attribute": "",
                                         }
                                     ]
                                 })
    variance_threshold = toolkit_repo.create(variance_threshold)
    ownership_business.add(user, False, toolkit=variance_threshold)

    select_k_best_chi2 = Toolkit(name='卡方选择法',
                                 description='选择K个最好的特征，返回选择特征后的数据',
                                 category=1,
                                 entry_function='select_k_best_chi2',
                                 target_py_code=inspect.getsource(
                                     preprocess_orig.select_k_best_chi2),
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
                                             'name': 'k',
                                             'type': {
                                                 'key': 'int',
                                                 'des': 'select k best, k is number of features selected',
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
                                    target_py_code=inspect.getsource(
                                        preprocess_orig.select_k_best_pearson),
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
                                                'name': 'k',
                                                'type': {
                                                    'key': 'int',
                                                    'des': 'select k best, k is number of features selected',
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
                                            'name': 'k',
                                            'type': {
                                                'key': 'int',
                                                'des': 'select k best, k is number of features selected',
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
                                  'des': 'select k best, k is number of features selected',
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
                                   target_py_code=inspect.getsource(
                                       preprocess_orig.select_from_model_lr),
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
                                       }
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
                                     target_py_code=inspect.getsource(
                                         preprocess_orig.select_from_model_gbdt),
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
                                             'y_data_type': ['int']
                                         }
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
                              'name': 'n_features',
                              'type': {
                                  'key': 'int',
                                  'des': 'the number of de-features',
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
                              "name": "label",
                              "des": "降维后的栏位信息",
                              "if_add_column": True,
                              "attribute": "label"
                          },
                          {
                              "name": "coef",
                              "des": "每类特征是相关系数",
                              "if_add_column": False,
                              "attribute": "value"
                          },
                          {
                              "name": "mean",
                              "des": "每类特征是数值平均值",
                              "if_add_column": False,
                              "attribute": "value"
                          },
                          {
                              "name": "priors",
                              "des": "array-like, shape = [n_classes], Class priors (sum to 1).",
                              "if_add_column": False,
                              "attribute": "general_info"
                          },
                          {
                              "name": "scalings",
                              "des": "array-like, shape = [rank, n_classes - 1], Scaling of the features in the space spanned by the class centroids.",
                              "if_add_column": False,
                              "attribute": "value"
                          },
                          {
                              "name": "xbar",
                              "des": "Overall mean",
                              "if_add_column": False,
                              "attribute": "value"
                          }
                      ]
                  })
    lda = toolkit_repo.create(lda)
    ownership_business.add(user, False, toolkit=lda)

    MIC = Toolkit(name='最大互信息数',
                  description='计算所选数据集合的最大互信息数, 表达第一个所选值域与其他值域变量之间的相关系数',
                  category=4,
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
                  },
                  result_spec={
                      "if_reserved": False,
                      "args": [
                          {
                              "name": "result",
                              "des": "所选范围的样本的MIC的结果",
                              "if_add_column": False,
                              "attribute": "label"
                          }
                      ]
                  })
    MIC = toolkit_repo.create(MIC)
    ownership_business.add(user, False, toolkit=MIC)

    DUM = Toolkit(name='类别转数字',
                  description='将一组类别属性的数据，转化成几列数字组成的矩阵',
                  category=2,
                  entry_function='get_dummy',
                  target_py_code=inspect.getsource(preprocess_orig.get_dummy),
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
                          'data_type': ['int', 'float', 'str']
                      }
                  },
                  result_spec={
                      "if_reserved": True,
                      "args": [
                          {
                              "name": "result",
                              "des": "所选范围的样本的dummy的结果",
                              "if_add_column": True,
                              "attribute": "label"
                          }
                      ]
                  })
    DUM = toolkit_repo.create(DUM)
    ownership_business.add(user, False, toolkit=DUM)

    CUT = Toolkit(name='数字转类别方法',
                  description='将一组数据，转化成类别',
                  category=2,
                  entry_function='pandas_cut',
                  target_py_code=inspect.getsource(preprocess_orig.pandas_cut),
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
                          'data_type': ['int', 'float', 'string']
                      },
                      "args": [
                          {
                              'name': 'bins',
                              'type': {
                                  'key': 'int',
                                  'des': 'the number of bins',
                                  'range': [2, None]
                              },
                              'default': 3,
                              'required': True
                          },
                          {
                              'name': 'labels',
                              'type': {
                                  'key': 'string_m',
                                  'des': 'multiple labels',
                              },
                              'default': None,
                              'len_range': None,
                              'required': False
                          }
                      ]
                  },
                  result_spec={
                      "if_reserved": True,
                      "args": [
                          {
                              "name": "result",
                              "des": "continuous to category",
                              "if_add_column": True,
                              "attribute": "label"
                          }
                      ]
                  })
    CUT = toolkit_repo.create(CUT)
    ownership_business.add(user, False, toolkit=CUT)


def update_one_public_toolkit():
    """
        数据库建一个toolkit的collection, 记载public的数据分析工具包简介
    """
    user = user_business.get_by_user_ID('system')

    TMP = Toolkit(name='字符串转数字类别',
                  description='将一组类别属性的数据，转化为数字的类别',
                  category=2,
                  entry_function='str_to_categories',
                  target_py_code=inspect.getsource(preprocess_orig.str_to_categories),
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
                          'data_type': ['str']
                      }
                  },
                  result_spec={
                      "if_reserved": True,
                      "args": [
                          {
                              "name": "result",
                              "des": "所选范围的样本的数字分类结果",
                              "if_add_column": True,
                              "attribute": "label"
                          }
                      ]
                  })
    TMP = toolkit_repo.create(TMP)
    ownership_business.add(user, False, toolkit=TMP)


def remove_one_public_toolkit():
    # user = user_business.get_by_user_ID('system')
    toolkit = get_by_toolkit_name('最大互信息数')
    remove(toolkit)
    # 已舍去
    # ownership_business.remove_ownership_by_user_and_owned_item(user, toolkit, 'toolkit')


# input = SPEC.ui_spec['input']


class StepTemplate(object):
    data_source = {
        'name': 'data_source',
        'display_name': 'select data source',
        'args': [
            {
                **SPEC.ui_spec['choice'],
                "name": "input",
                "des": "",
            }
        ],
    }

    fields = {
        'name': 'fields',
        'display_name': 'select fields',
        'args': [
            {
                **SPEC.ui_spec['multiple_choice'],
                'name': 'fields',
                'des': '',
            }
        ],
    }

    parameters = {
        'name': 'parameters',
        'display_name': 'input parameters',
        'args': [
            {
                **SPEC.ui_spec['input'],
                'name': 'k',
                'display_name': 'k',
                'value_type': 'int',
                'range': [2, None],
                'des': 'the number of clustering numbers',
            }
        ]
    }

    custom = {
        'name': 'custom',
        'display_name': 'custom step',
        'args': [
            {
                **SPEC.ui_spec['input'],
                'name': 'k',
                'display_name': 'k',
                'value_type': 'int',
                'range': [2, None],
                'des': 'the number of clustering numbers',
            }
        ]
    }

    setting = {
        'name': 'setting',
        'display_name': 'setting step',
        'args': [
            {
                **SPEC.ui_spec['choice'],
                'name': 'save_or_save_as',
                'display_name': 'save type',
                "range": [
                    "save",
                    {
                        **SPEC.ui_spec['input'],
                        'name': 'save_as',
                        'display_name': 'save as name',
                        'value_type': 'str',
                        "default": "new_staging_dataset",
                    },
                ],
                "default": "save",
                "required": True,
            },

        ]
    }

    feature_fields = {
        **fields,
        'name': 'feature_fields',
        'display_name': 'select x fields'
    }




def update_toolkit():
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
                                'name': 'n_clusters',
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
                                "name": "Clustering_Label",
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
                    },
                    steps=[
                        {
                            **StepTemplate.data_source
                        },
                        {
                            **StepTemplate.fields
                        },
                        {
                            **StepTemplate.parameters,
                            'args': [
                                {
                                    **SPEC.ui_spec['input'],
                                    'name': 'k',
                                    'display_name': 'k',
                                    'value_type': 'int',
                                    'range': [2, None],
                                    'des': 'the number of clustering numbers',
                                }
                            ]
                        },
                        {
                            **StepTemplate.setting,
                        }
                    ]
                    )

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
                  },
                  result_spec={
                      "if_reserved": False,
                      "args": [
                          {
                              "name": "simple_moving_average",
                              "des": "所选范围的样本的移动平均值",
                              "if_add_column": False,
                              "attribute": "value"
                          }
                      ]
                  },
                  steps=[
                      {
                          'name': 'data_source',
                          'display_name': 'select data source',
                          'args': [
                              {
                                  **SPEC.ui_spec['choice'],
                                  "name": "input",
                                  "des": "",
                              }
                          ],
                      },
                      {
                          'name': 'fields',
                          'display_name': 'select fields',
                          'args': [
                              {
                                  **SPEC.ui_spec['multiple_choice'],
                                  'name': 'fields',
                                  'des': '',
                              }
                          ],
                      },
                      {
                          'name': 'parameters',
                          'display_name': 'input parameters',
                          'args': [
                              {
                                  **SPEC.ui_spec['input'],
                                  'range': [2, None],
                                  'name': 'window',
                                  'display_name': 'window',
                                  'type': 'input',
                                  'value_type': 'int',
                                  'default': 3,
                                  'des': 'the window of moving average',
                                  'required': True,

                              }
                          ]
                      }
                  ]
                  )

    SIMPLE_KMEAN = Toolkit(name='简单的K平均数算法',
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
                                       'name': 'n_clusters',
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
                                       "name": "Clustering_Label",
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
                           },
                           steps=[
                               {
                                   'name': 'data_source',
                                   'display_name': 'select data source',
                                   'args': [
                                       {
                                           **SPEC.ui_spec['choice'],
                                           "name": "input",
                                           "des": "",
                                       }
                                   ],
                               },
                               {
                                   'name': 'fields',
                                   'display_name': 'select fields',
                                   'args': [
                                       {
                                           **SPEC.ui_spec['multiple_choice'],
                                           'name': 'fields',
                                           'des': '',
                                       }
                                   ],
                               },
                               {
                                   'name': 'parameters',
                                   'display_name': 'input parameters',
                                   'args': [
                                       {
                                           **SPEC.ui_spec['input'],
                                           'name': 'k',
                                           'display_name': 'k',
                                           'value_type': 'int',
                                           'range': [2, None],
                                           'des': 'the number of clustering numbers',
                                           'value': 2,
                                           'default': 2,
                                           'required': True,
                                       }
                                   ]
                               }
                           ]
                           )

    # Result_orm 重新设计
    PEARSON = Toolkit(name='皮尔森相关系数',
                      description='计算所选数据集合的皮尔森相关系数, 表达两变量之间(线性)相关系数',
                      category=4,
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
                      },
                      result_spec={
                          "if_reserved": False,
                          "args": [
                              {
                                  "name": "pearson",
                                  "des": "所选范围的样本的皮尔森相关系数",
                                  "if_add_column": False,
                                  "attribute": "value"
                              }
                          ]
                      },
                      steps=[
                          {
                              **StepTemplate.data_source
                          },
                          {
                              **StepTemplate.fields
                          }
                      ]
                      )

    variance_threshold = Toolkit(name='方差选择法',
                                 description='选取合适的特征，方差选择法',
                                 category=1,
                                 entry_function='variance_threshold',
                                 target_py_code=inspect.getsource(
                                     preprocess_orig.variance_threshold),
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
                                             "attribute": "",
                                         }
                                     ]
                                 },
                                 steps=[
                                     {
                                         **StepTemplate.data_source
                                     },
                                     {
                                         **StepTemplate.fields
                                     },
                                     {
                                         **StepTemplate.parameters,
                                         'args': [
                                             {
                                                 **SPEC.ui_spec['input'],
                                                 'name': 'threshold',
                                                 'display_name': 'threshold',
                                                 'value_type': 'float',
                                                 'des': 'Tian yi is coming, the threshold to judge if positive of negative',
                                                 'default': 1,
                                                 'required': True,
                                             }
                                         ]
                                     }
                                 ]
                                 )

    CV = Toolkit(name='变异系数',
                 description='返回数据变异系数',
                 category=4,
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
                 },
                 result_spec={
                     "if_reserved": False,
                     "args": [
                         {
                             "name": "cv",
                             "des": "所选范围的样本的变异系数",
                             "if_add_column": False,
                             "attribute": "value"
                         }
                     ]
                 },
                 steps=[
                     {
                         **StepTemplate.data_source
                     },
                     {
                         **StepTemplate.fields
                     }
                 ]
                 )

    CORRELATION = Toolkit(name='数据互相关',
                          description='返回数据correlation',
                          category=4,
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
                          },
                          result_spec={
                              "if_reserved": False,
                              "args": [
                                  {
                                      "name": "correlation",
                                      "des": "所选范围的样本的互相关系数",
                                      "if_add_column": False,
                                      "attribute": "value"
                                  }
                              ]
                          },
                          steps=[
                              {
                                  **StepTemplate.data_source
                              },
                              {
                                  **StepTemplate.fields
                              }
                          ])

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
                                 'len_range': [2, None],
                                 'data_type': ['int', 'float']
                             }
                         },
                         result_spec={
                             "if_reserved": True,
                             "args": [
                                 {
                                     "name": "result",
                                     "des": "数值转换，对所选数据做标准化处理",
                                     "if_add_column": True,
                                     "attribute": "label"
                                 }
                             ]
                         },
                         steps=[
                             {
                                 **StepTemplate.data_source
                             },
                             {
                                 **StepTemplate.fields
                             }
                         ])


    # TODO 增加fields
    select_k_best_chi2 = Toolkit(name='卡方选择法',
                                 description='选择K个最好的特征，返回选择特征后的数据',
                                 category=1,
                                 entry_function='select_k_best_chi2',
                                 target_py_code=inspect.getsource(
                                     preprocess_orig.select_k_best_chi2),
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
                                             'name': 'k',
                                             'type': {
                                                 'key': 'int',
                                                 'des': 'select k best, k is number of features selected',
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
                                 },
                                 steps=[
                                     {
                                         **StepTemplate.data_source
                                     },
                                     {
                                         **StepTemplate.fields,
                                         'name': 'feature_fields',
                                         'display_name': 'select x fields'
                                     },
                                     {
                                         **StepTemplate.fields,
                                         'name': 'label_fields',
                                         'display_name': 'select y fields'
                                     },
                                     {
                                         **StepTemplate.parameters,
                                         'args': [
                                             {
                                                 **SPEC.ui_spec['input'],
                                                 'name': 'k',
                                                 'display_name': 'k',
                                                 'value_type': 'int',
                                                 'des': 'select k best, k is number of features selected',
                                                 'default': 2,
                                                 'required': True,
                                             }
                                         ]
                                     }
                                 ])

    select_k_best_pearson = Toolkit(name='相关系数选择法',
                                    description='选择K个最好的特征，返回选择特征后的数据',
                                    category=1,
                                    entry_function='select_k_best_pearson',
                                    target_py_code=inspect.getsource(
                                        preprocess_orig.select_k_best_pearson),
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
                                                'name': 'k',
                                                'type': {
                                                    'key': 'int',
                                                    'des': 'select k best, k is number of features selected',
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
                                    },
                                    steps=[
                                        {
                                            **StepTemplate.data_source
                                        },
                                        {
                                            **StepTemplate.fields
                                        },
                                        {
                                            **StepTemplate.parameters,
                                            'args': [
                                                {
                                                    **SPEC.ui_spec['input'],
                                                    'name': 'k',
                                                    'display_name': 'k',
                                                    'value_type': 'int',
                                                    'des': 'select k best, k is number of features selected',
                                                    'default': 2,
                                                    'required': True,
                                                }
                                            ]
                                        }
                                    ])

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
                                            'name': 'k',
                                            'type': {
                                                'key': 'int',
                                                'des': 'select k best, k is number of features selected',
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
                                },
                                steps=[
                                    {
                                        **StepTemplate.data_source
                                    },
                                    {
                                        **StepTemplate.fields
                                    },
                                    {
                                        **StepTemplate.parameters,
                                        'args': [
                                            {
                                                **SPEC.ui_spec['input'],
                                                'name': 'k',
                                                'display_name': 'k',
                                                'value_type': 'int',
                                                'des': 'select k best, k is number of features selected',
                                                'default': 2,
                                                'required': True,
                                            }
                                        ]
                                    }
                                ])

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
                                  'des': 'select k best, k is number of features selected',
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
                  },
                  steps=[
                      {
                          **StepTemplate.data_source
                      },
                      {
                          **StepTemplate.fields
                      },
                      {
                          **StepTemplate.parameters,
                          'args': [
                              {
                                  **SPEC.ui_spec['input'],
                                  'name': 'n_features',
                                  'display_name': 'n_features',
                                  'value_type': 'int',
                                  'des': 'select k best, k is number of features selected',
                                  'default': 2,
                                  'required': True,
                              }
                          ]
                      }
                  ])

    '''
    1. 合并添加列
    2. 自定义添加列
    3. 合并添加行
    
    合并添加列
    1. 选择目标数据源
    2. 选择来源数据源
    3. 选择index
    4. 选择添加的fields（temp run)
    5. 有多少index 对应不上，所做的处理，每个column单独选择？
    6. setting
    
    合并添加行
    1. 选择目标数据源
    2. 选择来源数据源
    3. 目标数据源列匹配与设置
    
    自定义添加列
    1. 选择目标数据源
    2. 新列生成方式
    
    
    '''
    add_columns_append = Toolkit(
        name='合并添加列',
        description='通过其他数据表数据添加列',
        # category=1,
        # entry_function='ref',
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
                        'des': 'select k best, k is number of features selected',
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
        },
        steps=[
            {
                **StepTemplate.data_source,
                "name": 'target_datasource'
            },

            {
                **StepTemplate.data_source,
                "name": 'from_datasource'
            },
            {
                "name": 'select_index',
                'display_name': 'Select index',
                'args': [
                    {
                        **SPEC.ui_spec['multiple_choice'],
                        'name': 'target_datasource_index',
                        'display_name': 'target_datasource_index',
                        # "len_range": [1, 1],
                        "required": True,
                    },
                    {
                        **SPEC.ui_spec['multiple_choice'],
                        'name': 'from_datasource_index',
                        'display_name': 'from_datasource_index',
                        # "len_range": [1, 1],
                        "required": True,
                    }
                ]
            },
            {
                **StepTemplate.fields,
                "name": 'from_fields'
            },
            {
                **StepTemplate.parameters,
                'args': [
                    {
                        **SPEC.ui_spec['choice'],
                        'name': 'action',
                        'display_name': 'n_features',
                        'value_type': 'int',
                        'des': 'action after the row without index of from datasource',

                        "range": [
                            "0",
                            "null",
                            "-1",
                        ],
                        'default': 'null',
                        # 'required': True,
                    }
                ]
            }
        ]
    )

    TOOLKIT_DICT = [
        {
            "_id": ObjectId("5980149d8be34d34da32c170"),
            "object": KMEAN
        },
        {
            "_id": ObjectId("5980149d8be34d34da32c166"),
            "object": SMA
        },
        {
            '_id': ObjectId("59f297cad845c05376f599c6"),
            "object": SIMPLE_KMEAN
        },
        {
            '_id': ObjectId("5980149d8be34d34da32c16e"),
            "object": PEARSON
        },
        {
            '_id': ObjectId("5980149d8be34d34da32c192"),
            "object": variance_threshold
        }

        ,
        {
            '_id': ObjectId("5980149d8be34d34da32c17a"),
            "object": CV
        },
        {
            '_id': ObjectId("5980149d8be34d34da32c180"),
            "object": CORRELATION
        },
        {
            '_id': ObjectId("5980149d8be34d34da32c188"),
            "object": normalizer
        },
        {
            '_id': ObjectId("5980149d8be34d34da32c194"),
            "object": select_k_best_chi2
        },

        {
            '_id': ObjectId("5980149d8be34d34da32c196"),
            "object": select_k_best_pearson
        },
        {
            '_id': ObjectId("5980149d8be34d34da32c198"),
            "object": select_k_best_mic
        },
        {
            '_id': ObjectId("5980149d8be34d34da32c19a"),
            "object": REF
        },

        # {
        #     '_id': None,
        #     'object': add_columns_append
        # }
    ]
    user = user_business.get_by_user_ID('system')

    for toolkit in TOOLKIT_DICT:
        if not toolkit["_id"]:
            # create toolkit, then add _id to TOOLKIT_DICT
            new_toolkit_obj = toolkit_repo.create(toolkit['object'])
            ownership_business.add(user, False, toolkit=new_toolkit_obj)
        else:

            toolkit_obj = get_by_toolkit_id(toolkit["_id"])
            attributes = ['name', 'description', 'category', 'result_form', 'entry_function',
                          'target_py_code', 'parameter_spec', 'result_spec', 'steps']
            for attribute in attributes:
                if hasattr(toolkit['object'], attribute):
                    toolkit_obj[attribute] = toolkit['object'][attribute]
            toolkit_obj.save()


if __name__ == '__main__':
    update_toolkit()
    pass
