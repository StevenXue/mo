from bson.objectid import ObjectId
import inspect

from server3.lib import toolkit_orig, preprocess_orig
from server3.entity.toolkit import Toolkit
from server3.repository.toolkit_repo import ToolkitRepo
from server3.business import user_business, ownership_business

from server3.business.toolkit_business import get_by_toolkit_id
from server3.constants import SPEC

toolkit_repo = ToolkitRepo(Toolkit)
############################################## new #################################################


class StepTemplate(object):
    data_source = {
        'name': 'data_source',
        'display_name': 'Select data source',
        'des': 'select the datasource to process',
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
        'display_name': 'Select fields',
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
        'display_name': 'Input parameters',
        'des': 'fill all required parameters',
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

    # custom = {
    #     'name': 'custom',
    #     'display_name': 'custom step',
    #     'args': [
    #         {
    #             **SPEC.ui_spec['input'],
    #             'name': 'k',
    #             'display_name': 'k',
    #             'value_type': 'int',
    #             'range': [2, None],
    #             'des': 'the number of clustering numbers',
    #         }
    #     ]
    # }

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

    label_fields = {
        **fields,
        'name': 'label_fields',
        'display_name': 'select y fields',
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
                            **StepTemplate.fields,
                            'args': [
                                {
                                    **StepTemplate.fields['args'][0],
                                    'len_range': [1, None],
                                    'value_type': ['int', 'float'],
                                    # **SPEC.ui_spec['multiple_choice'],
                                    # 'name': 'fields',
                                }
                            ],
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
                                    'default': 3,
                                    'value': 2,
                                    'required': True,
                                }
                            ]
                        },
                        # {
                        #     **StepTemplate.setting,
                        # }
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
                          **StepTemplate.data_source,
                      },
                      {
                          **StepTemplate.fields,
                          'args': [
                              {
                                  **StepTemplate.fields['args'][0],
                                  'len_range': [1, 1],
                                  'value_type': ['int', 'float'],
                                  # **SPEC.ui_spec['multiple_choice'],
                                  # 'name': 'fields',
                              }
                          ],
                      },
                      {
                          **StepTemplate.parameters,
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

    # SIMPLE_KMEAN = KMEAN
    # SIMPLE_KMEAN_steps = KMEAN.steps
    # SIMPLE_KMEAN_steps[2]['args'][0]["value"]=2
    # SIMPLE_KMEAN.steps = SIMPLE_KMEAN_steps

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
                                   **StepTemplate.data_source,
                               },
                               {
                                   **StepTemplate.fields,
                                   'args': [
                                       {
                                           **StepTemplate.fields['args'][0],
                                           'len_range': [1, None],
                                           'value_type': ['int', 'float'],
                                           # **SPEC.ui_spec['multiple_choice'],
                                           # 'name': 'fields',
                                       }
                                   ],
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
                              **StepTemplate.fields,
                              'args': [
                                  {
                                      **StepTemplate.fields['args'][0],
                                      'len_range': [2, 2],
                                      'value_type': ['int', 'float'],
                                      # **SPEC.ui_spec['multiple_choice'],
                                      # 'name': 'fields',
                                  }
                              ],
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
                                         **StepTemplate.fields,
                                         'args': [
                                             {
                                                 **StepTemplate.fields['args'][0],
                                                 'len_range': [1, None],
                                                 'value_type': ['int', 'float'],
                                                 # **SPEC.ui_spec['multiple_choice'],
                                                 # 'name': 'fields',
                                             }
                                         ],
                                     },
                                     {
                                         **StepTemplate.parameters,
                                         'args': [
                                             {
                                                 **SPEC.ui_spec['input'],
                                                 'name': 'threshold',
                                                 'display_name': 'threshold',
                                                 'value_type': 'float',
                                                 'des': 'the threshold to judge if '
                                                        'positive of negative',
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
                         **StepTemplate.fields,
                         'args': [
                             {
                                 **StepTemplate.fields['args'][0],
                                 'len_range': [1, 1],
                                 'value_type': ['int', 'float'],
                                 # **SPEC.ui_spec['multiple_choice'],
                                 # 'name': 'fields',
                             }
                         ],
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
                                  **StepTemplate.fields,
                                  'args': [
                                      {
                                          **SPEC.ui_spec['multiple_choice'],
                                          'name': 'fields',
                                          'des': '',
                                          'len_range': [2, 2],
                                      }
                                  ],
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
                                 **StepTemplate.fields,
                                 'args': [
                                     {
                                         **StepTemplate.fields['args'][0],
                                         'len_range': [2, 2],
                                         'value_type': ['int', 'float'],
                                         # **SPEC.ui_spec['multiple_choice'],
                                         # 'name': 'fields',
                                     }
                                 ],

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
                                         'args': [
                                             {
                                                 **SPEC.ui_spec['multiple_choice'],
                                                 'name': 'fields',
                                                 'des': '',
                                                 'len_range': [2, None],
                                                 'value_type': ['int', 'float'],
                                             }
                                         ],
                                         'name': 'feature_fields',
                                         'display_name': 'select x fields',

                                     },
                                     {
                                         **StepTemplate.fields,
                                         'args': [
                                             {
                                                 **SPEC.ui_spec['multiple_choice'],
                                                 'name': 'fields',
                                                 'des': '',
                                                 'len_range': [1, 1],
                                                 'value_type': ['int', 'float'],
                                             }
                                         ],
                                         'name': 'label_fields',
                                         'display_name': 'select y fields',

                                     },
                                     {
                                         **StepTemplate.parameters,
                                         'args': [
                                             {
                                                 **SPEC.ui_spec['input'],
                                                 'name': 'k',
                                                 'display_name': 'k',
                                                 'value_type': 'int',
                                                 'des': 'select k best, k is number of '
                                                        'features selected',
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
                                            **StepTemplate.fields,
                                            'args': [
                                                {
                                                    **SPEC.ui_spec['multiple_choice'],
                                                    'name': 'fields',
                                                    'des': '',
                                                    'len_range': [2, None],
                                                    'value_type': ['int', 'float'],
                                                }
                                            ],
                                            'name': 'feature_fields',
                                            'display_name': 'select x fields',

                                        },
                                        {
                                            **StepTemplate.fields,
                                            'args': [
                                                {
                                                    **SPEC.ui_spec['multiple_choice'],
                                                    'name': 'fields',
                                                    'des': '',
                                                    'len_range': [1, 1],
                                                    'value_type': ['int', 'float'],
                                                }
                                            ],
                                            'name': 'label_fields',
                                            'display_name': 'select y fields',

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
                                        **StepTemplate.fields,
                                        'args': [
                                            {
                                                **SPEC.ui_spec['multiple_choice'],
                                                'name': 'fields',
                                                'des': '',
                                                'len_range': [2, None],
                                                'value_type': ['int', 'float'],
                                            }
                                        ],
                                        'name': 'feature_fields',
                                        'display_name': 'select x fields',


                                    },
                                    {
                                        **StepTemplate.fields,
                                        'args': [
                                            {
                                                **SPEC.ui_spec['multiple_choice'],
                                                'name': 'fields',
                                                'des': '',
                                                'len_range': [1, 1],
                                                'value_type': ['int', 'float'],
                                            }
                                        ],
                                        'name': 'label_fields',
                                        'display_name': 'select y fields',

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
                          **StepTemplate.fields,
                          'args': [
                              {
                                  **SPEC.ui_spec['multiple_choice'],
                                  'name': 'fields',
                                  'des': '',
                                  'len_range': [2, None],
                                  'value_type': ['int', 'float'],
                              }
                          ],
                          'name': 'feature_fields',
                          'display_name': 'select x fields',


                      },
                      {
                          **StepTemplate.fields,
                          'args': [
                              {
                                  **SPEC.ui_spec['multiple_choice'],
                                  'name': 'fields',
                                  'des': '',
                                  'len_range': [1, 1],
                                  'value_type': ['int', 'float'],
                              }
                          ],
                          'name': 'label_fields',
                          'display_name': 'select y fields',

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
        category=-1,
        entry_function='add_columns_append',
        target_py_code=inspect.getsource(preprocess_orig.add_columns_append),
        # parameter_spec={
        #     "data": {
        #         'name': 'input',
        #         'type': {
        #             'key': 'transfer_box',
        #             'des': 'nD tensor with shape: (batch_size, ..., '
        #                    'input_dim). The most common situation would be a '
        #                    '2D input with shape (batch_size, input_dim).',
        #             'range': None
        #         },
        #         'default': None,
        #         'required': True,
        #         'x_len_range': [2, None],
        #         'y_len_range': [1, 1],
        #
        #         'x_data_type': ['int', 'float'],
        #         'y_data_type': ['int', 'float']
        #     },
        #     "args": [
        #         {
        #             'name': 'n_features',
        #             'type': {
        #                 'key': 'int',
        #                 'des': 'select k best, k is number of features selected',
        #                 'range': [1, None]
        #             },
        #             'default': 2,
        #             'required': True
        #         }
        #     ]
        # },
        result_spec={
            # "if_reserved": True,
            "args": [
                # {
                #     "name": "scores",
                #     "des": "每类特征得到的评分估算",
                #     "if_add_column": False,
                #     "attribute": "value",
                #     "usage": ["bar"]
                # },
                # {
                #     "name": "index",
                #     "des": "每类特征是否取用的标签",
                #     "if_add_column": False,
                #     "attribute": "label",
                #     "usage": ["bar", "table"]
                # },
                # {
                #     "name": "result",
                #     "des": "筛选出的所有特征值",
                #     "if_add_column": False,
                #     "attribute": "value",
                # }
            ]
        },
        steps=[
            {
                **StepTemplate.data_source,
                "name": 'target_datasource',
                'display_name': 'select target data source',
            },

            {
                **StepTemplate.data_source,
                "name": 'from_datasource',
                'display_name': 'select from data source',
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
                        'range': {
                            'type': 'from_step',
                            'step_name': 'target_datasource',
                            'step_index': 0,
                            'arg_index': 0,
                            'value_name': 'fields'
                        },
                        # "required": True,
                    },
                    # {
                    #     **SPEC.ui_spec['multiple_choice'],
                    #     'name': 'from_datasource_index',
                    #     'display_name': 'from_datasource_index',
                    #     # "len_range": [1, 1],
                    #     "required": True,
                    #     'range': {
                    #         'type': 'from_step',
                    #         'step_name': 'target_datasource',
                    #         'step_index': 0,
                    #         'arg_index': 0,
                    #         'value_name': 'fields'
                    #     },
                    # }
                ]
            },
            {
                **StepTemplate.fields,
                "name": 'from_fields',
                'display_name': 'select added fields',
                'args': [
                    {
                        **SPEC.ui_spec['multiple_choice'],
                        'name': 'fields',
                        'des': '',
                        'range': {
                            'type': 'from_step',
                            'step_name': 'from_datasource',
                            'step_index': 1,
                            'arg_index': 0,
                            'value_name': 'fields'
                        }
                    }
                ],

            },
            {
                **StepTemplate.parameters,
                'args': [
                    {
                        **SPEC.ui_spec['choice'],
                        'name': 'exception_handing',
                        'display_name': 'exception handing',
                        # 'value_type': '',
                        'des': 'action after the row without index of from datasource',

                        "range": [
                            'NAN'
                            "0",
                            "null",
                            "-1",
                        ],
                        'default': 'NAN',

                        # 'required': True,
                    }
                ]
            }
        ]
    )

    add_row_append = Toolkit(
        name='合并添加行',
        description='通过其他数据表数据添加行',
        category=-1,
        entry_function='add_rows_append',
        target_py_code=inspect.getsource(preprocess_orig.add_rows_append),
        # parameter_spec={
        #     "data": {
        #         'name': 'input',
        #         'type': {
        #             'key': 'transfer_box',
        #             'des': 'nD tensor with shape: (batch_size, ..., '
        #                    'input_dim). The most common situation would be a '
        #                    '2D input with shape (batch_size, input_dim).',
        #             'range': None
        #         },
        #         'default': None,
        #         'required': True,
        #         'x_len_range': [2, None],
        #         'y_len_range': [1, 1],
        #
        #         'x_data_type': ['int', 'float'],
        #         'y_data_type': ['int', 'float']
        #     },
        #     "args": [
        #         {
        #             'name': 'n_features',
        #             'type': {
        #                 'key': 'int',
        #                 'des': 'select k best, k is number of features selected',
        #                 'range': [1, None]
        #             },
        #             'default': 2,
        #             'required': True
        #         }
        #     ]
        # },
        result_spec={
            # "if_reserved": True,
            "args": [
                # {
                #     "name": "scores",
                #     "des": "每类特征得到的评分估算",
                #     "if_add_column": False,
                #     "attribute": "value",
                #     "usage": ["bar"]
                # },
                # {
                #     "name": "index",
                #     "des": "每类特征是否取用的标签",
                #     "if_add_column": False,
                #     "attribute": "label",
                #     "usage": ["bar", "table"]
                # },
                # {
                #     "name": "result",
                #     "des": "筛选出的所有特征值",
                #     "if_add_column": False,
                #     "attribute": "value",
                # }
            ]
        },
        steps=[
            {
                **StepTemplate.data_source,
                "name": 'target_datasource',
                'display_name': 'select target data source',
            },

            {
                **StepTemplate.data_source,
                "name": 'from_datasource',
                'display_name': 'select from data source',
            },
            {
                **StepTemplate.parameters,
                'args': [
                    {
                        **SPEC.ui_spec['choice'],
                        'name': 'exception_handing',
                        'display_name': 'exception handing',
                        'des': 'action after the row without index of from datasource',
                        "range": [
                            'NAN'
                            "0",
                            "null",
                            "-1",
                        ],
                        'default': 'NAN',
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
        {
            '_id': ObjectId('5a014c9dd845c0523f3a9ff1'),
            'object': add_columns_append
        },
        {
            '_id': ObjectId("5a02cb1cd845c01d60bde956"),
            'object': add_row_append
        }
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
