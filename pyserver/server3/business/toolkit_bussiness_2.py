from bson.objectid import ObjectId
import inspect

from server3.lib import toolkit_orig, preprocess_orig
from server3.entity.toolkit import Toolkit
from server3.repository.toolkit_repo import ToolkitRepo
from server3.business import user_business, ownership_business

from server3.business.toolkit_business import get_by_toolkit_id
from server3.constants import SPEC

toolkit_repo = ToolkitRepo(Toolkit)


class StepTemplate(object):
    data_source = {
        "name": "data_source",
        "display_name": "Select data source",
        "des": "select the datasource to process",
        "args": [
            {
                **SPEC.ui_spec["choice"],
                "name": "input",
                "des": "",
            }
        ],
    }

    fields = {
        "name": "fields",
        "display_name": "Select fields",
        "args": [
            {
                **SPEC.ui_spec["multiple_choice"],
                "name": "fields",
                "des": "",
            }
        ],
    }

    feature_fields = {
        **fields,
        "name": "feature_fields",
        "display_name": "select x fields"
    }

    label_fields = {
        **fields,
        "name": "label_fields",
        "display_name": "select y fields",
    }

    parameters = {
        "name": "parameters",
        "display_name": "Input parameters",
        "des": "fill all required parameters",
        "args": [
            {
                **SPEC.ui_spec["input"],
                "name": "k",
                "display_name": "k",
                "value_type": "int",
                "range": [2, None],
                "des": "the number of clustering numbers",
            }
        ]
    }

    setting = {
        "name": "setting",
        "display_name": "setting step",
        "args": [
            {
                **SPEC.ui_spec["choice"],
                "name": "save_or_save_as",
                "display_name": "save type",
                "range": [
                    "save",
                    {
                        **SPEC.ui_spec["input"],
                        "name": "save_as",
                        "display_name": "save as name",
                        "value_type": "str",
                        "default": "new_staging_dataset",
                    },
                ],
                "default": "save",
                "required": True,
            },

        ]
    }


class MathToolkit(object):
    """
    不带 args
    """
    # 此区域的基本steps
    math_template_steps = [
        {
            **StepTemplate.data_source
        },
        {
            **StepTemplate.fields,
            "args": [
                {
                    **StepTemplate.fields["args"][0],
                    "len_range": [1, 1],
                    "value_type": ["int", "float"],
                    "require": True
                }
            ],
        }]

    AVG_ObjectId = ObjectId("5980149d8be34d34da32c160")
    AVG = Toolkit(name="平均值",
                  description="计算所选数据集合的平均值",
                  category=4,
                  entry_function="toolkit_average",
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_average),
                  parameter_spec={
                      "data": {
                          "name": "input",
                          "type": {
                              "key": "select_box",
                              "des": "nD tensor with shape: (batch_size, ..., "
                                     "input_dim). The most common situation would be a "
                                     "2D input with shape (batch_size, input_dim).",
                              "range": None
                          },
                          "default": None,
                          "required": True,
                          "len_range": [1, 1],
                          "data_type": ["int", "float"]
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
                  },
                  steps=math_template_steps
                  )

    MEDIAN_ObjectId = ObjectId("5980149d8be34d34da32c162")
    MEDIAN = Toolkit(name="中位数",
                     description="计算所选数据集合的中位数",
                     category=4,
                     entry_function="toolkit_median",
                     target_py_code=inspect.getsource(toolkit_orig.toolkit_median),
                     parameter_spec={
                         "data": {
                             "name": "input",
                             "type": {
                                 "key": "select_box",
                                 "des": "nD tensor with shape: (batch_size, ..., "
                                        "input_dim). The most common situation would be a "
                                        "2D input with shape (batch_size, input_dim).",
                                 "range": None
                             },
                             "default": None,
                             "required": True,
                             "len_range": [1, 1],
                             "data_type": ["int", "float"]
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
                     },
                     steps=math_template_steps
                     )

    MODE_ObjectId = ObjectId("5980149d8be34d34da32c164")
    MODE = Toolkit(name="众数",
                   description="计算所选数据集合的众数",
                   category=4,
                   entry_function="toolkit_mode",
                   target_py_code=inspect.getsource(toolkit_orig.toolkit_mode),
                   parameter_spec={
                       "data": {
                           "name": "input",
                           "type": {
                               "key": "select_box",
                               "des": "nD tensor with shape: (batch_size, ..., "
                                      "input_dim). The most common situation would be a "
                                      "2D input with shape (batch_size, input_dim).",
                               "range": None
                           },
                           "default": None,
                           "required": True,
                           "len_range": [1, 1],
                           "data_type": ["int", "float"]
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
                   },
                   steps=math_template_steps
                   )

    SMA_ObjectId = ObjectId("5980149d8be34d34da32c166")
    SMA = Toolkit(name="移动平均值",
                  description="计算所选数据集合的移动平均值",
                  category=4,
                  result_form=3,
                  entry_function="toolkit_moving_average",
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_moving_average),
                  parameter_spec={
                      "data": {
                          "name": "input",
                          "type": {
                              "key": "select_box",
                              "des": "nD tensor with shape: (batch_size, ..., "
                                     "input_dim). The most common situation would be a "
                                     "2D input with shape (batch_size, input_dim).",
                              "range": None
                          },
                          "default": None,
                          "required": True,
                          "len_range": [1, 1],
                          "data_type": ["int", "float"]
                      },
                      "args": [
                          {
                              "name": "window",
                              "type": {
                                  "key": "int",
                                  "des": "the window of moving average",
                                  "range": [2, None]
                              },
                              "default": 3,
                              "required": True
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
                          "args": [
                              {
                                  **StepTemplate.fields["args"][0],
                                  "len_range": [1, 1],
                                  "value_type": ["int", "float"],
                                  # **SPEC.ui_spec["multiple_choice"],
                                  # "name": "fields",
                              }
                          ],
                      },
                      {
                          **StepTemplate.parameters,
                          "args": [
                              {
                                  **SPEC.ui_spec["input"],
                                  "range": [2, None],
                                  "name": "window",
                                  "display_name": "window",
                                  "type": "input",
                                  "value_type": "int",
                                  "default": 3,
                                  "des": "the window of moving average",
                                  "required": True,

                              }
                          ]
                      }
                  ]
                  )

    RANGE_ObjectId = ObjectId("5980149d8be34d34da32c168")
    RANGE = Toolkit(name="全距",
                    description="计算所选数据集合的最大/最小值之差",
                    category=4,
                    entry_function="toolkit_range",
                    target_py_code=inspect.getsource(toolkit_orig.toolkit_range),
                    parameter_spec={
                        "data": {
                            "name": "input",
                            "type": {
                                "key": "select_box",
                                "des": "nD tensor with shape: (batch_size, ..., "
                                       "input_dim). The most common situation would be a "
                                       "2D input with shape (batch_size, input_dim).",
                                "range": None
                            },
                            "default": None,
                            "required": True,
                            "len_range": [1, 1],
                            "data_type": ["int", "float"]
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
                    },
                    steps=math_template_steps
                    )

    STD_ObjectId = ObjectId("5980149d8be34d34da32c16a")
    STD = Toolkit(name="标准差",
                  description="计算所选数据集合的标准差",
                  category=4,
                  entry_function="toolkit_std",
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_std),
                  parameter_spec={
                      "data": {
                          "name": "input",
                          "type": {
                              "key": "select_box",
                              "des": "nD tensor with shape: (batch_size, ..., "
                                     "input_dim). The most common situation would be a "
                                     "2D input with shape (batch_size, input_dim).",
                              "range": None
                          },
                          "default": None,
                          "required": True,
                          "len_range": [1, 1],
                          "data_type": ["int", "float"]
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
                  },
                  steps=math_template_steps
                  )

    VAR_ObjectId = ObjectId("5980149d8be34d34da32c16c")
    VAR = Toolkit(name="方差",
                  description="计算所选数据集合的方差",
                  category=4,
                  result_form=1,
                  entry_function="toolkit_variance",
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_variance),
                  parameter_spec={
                      "data": {
                          "name": "input",
                          "type": {
                              "key": "select_box",
                              "des": "nD tensor with shape: (batch_size, ..., "
                                     "input_dim). The most common situation would be a "
                                     "2D input with shape (batch_size, input_dim).",
                              "range": None
                          },
                          "default": None,
                          "required": True,
                          "len_range": [1, 1],
                          "data_type": ["int", "float"]
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
                  },
                  steps=math_template_steps
                  )

    N_ObjectId = ObjectId("5980149d8be34d34da32c176")
    N = Toolkit(name="数据量",
                description="返回数据个数",
                category=4,
                entry_function="toolkit_n",
                target_py_code=inspect.getsource(toolkit_orig.toolkit_n),
                parameter_spec={
                    "data": {
                        "name": "input",
                        "type": {
                            "key": "select_box",
                            "des": "nD tensor with shape: (batch_size, ..., "
                                   "input_dim). The most common situation would be a "
                                   "2D input with shape (batch_size, input_dim).",
                            "range": None
                        },
                        "default": None,
                        "required": True,
                        "len_range": [1, 1],
                        "data_type": ["int", "float"]
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
                },
                steps=math_template_steps
                )

    IQR_ObjectId = ObjectId("5980149d8be34d34da32c178")
    IQR = Toolkit(name="IQR",
                  description="数据列的IQR",
                  category=4,
                  entry_function="toolkit_IQR",
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_IQR),
                  parameter_spec={
                      "data": {
                          "name": "input",
                          "type": {
                              "key": "select_box",
                              "des": "nD tensor with shape: (batch_size, ..., "
                                     "input_dim). The most common situation would be a "
                                     "2D input with shape (batch_size, input_dim).",
                              "range": None
                          },
                          "default": None,
                          "required": True,
                          "len_range": [1, 1],
                          "data_type": ["int", "float"]
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
                  },
                  steps=math_template_steps
                  )

    CV_ObjectId = ObjectId("5980149d8be34d34da32c17a")
    CV = Toolkit(name="变异系数",
                 description="返回数据变异系数",
                 category=4,
                 entry_function="toolkit_cv",
                 target_py_code=inspect.getsource(toolkit_orig.toolkit_cv),
                 parameter_spec={
                     "data": {
                         "name": "input",
                         "type": {
                             "key": "select_box",
                             "des": "nD tensor with shape: (batch_size, ..., "
                                    "input_dim). The most common situation would be a "
                                    "2D input with shape (batch_size, input_dim).",
                             "range": None
                         },
                         "default": None,
                         "required": True,
                         "len_range": [1, 1],
                         "data_type": ["int", "float"]
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
                 steps=math_template_steps
                 )

    MAX_ObjectId = ObjectId("5980149d8be34d34da32c17c")
    MAX = Toolkit(name="最大值",
                  description="返回数据最大值",
                  category=4,
                  entry_function="toolkit_max",
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_max),
                  parameter_spec={
                      "data": {
                          "name": "input",
                          "type": {
                              "key": "select_box",
                              "des": "nD tensor with shape: (batch_size, ..., "
                                     "input_dim). The most common situation would be a "
                                     "2D input with shape (batch_size, input_dim).",
                              "range": None
                          },
                          "default": None,
                          "required": True,
                          "len_range": [1, 1],
                          "data_type": ["int", "float"]
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
                  },
                  steps=math_template_steps
                  )
    MIN_ObjectId = ObjectId("5980149d8be34d34da32c17e")
    MIN = Toolkit(name="最小值",
                  description="返回数据最小值",
                  category=4,
                  entry_function="toolkit_min",
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_min),
                  parameter_spec={
                      "data": {
                          "name": "input",
                          "type": {
                              "key": "select_box",
                              "des": "nD tensor with shape: (batch_size, ..., "
                                     "input_dim). The most common situation would be a "
                                     "2D input with shape (batch_size, input_dim).",
                              "range": None
                          },
                          "default": None,
                          "required": True,
                          "len_range": [1, 1],
                          "data_type": ["int", "float"]
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
                  },
                  steps=math_template_steps
                  )

    PEARSON_ObjectId = ObjectId("5980149d8be34d34da32c16e")
    PEARSON = Toolkit(name="皮尔森相关系数",
                      description="计算所选数据集合的皮尔森相关系数, 表达两变量之间(线性)相关系数",
                      category=4,
                      entry_function="toolkit_pearson",
                      target_py_code=inspect.getsource(toolkit_orig.toolkit_pearson),
                      parameter_spec={
                          "data": {
                              "name": "input",
                              "type": {
                                  "key": "select_box",
                                  "des": "nD tensor with shape: (batch_size, ..., "
                                         "input_dim). The most common situation would be a "
                                         "2D input with shape (batch_size, input_dim).",
                                  "range": None
                              },
                              "default": None,
                              "required": True,
                              "len_range": [2, 2],
                              "data_type": ["int", "float"]
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
                              "args": [
                                  {
                                      **StepTemplate.fields["args"][0],
                                      "len_range": [2, 2],
                                      "value_type": ["int", "float"],
                                  }
                              ],
                          }
                      ]
                      )

    COV_ObjectId = ObjectId("5980149d8be34d34da32c182")
    COV = Toolkit(name="数据协方差",
                  description="返回数据协方差",
                  category=4,
                  entry_function="toolkit_cov",
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_cov),
                  parameter_spec={
                      "data": {
                          "name": "input",
                          "type": {
                              "key": "select_box",
                              "des": "nD tensor with shape: (batch_size, ..., "
                                     "input_dim). The most common situation would be a "
                                     "2D input with shape (batch_size, input_dim).",
                              "range": None
                          },
                          "default": None,
                          "required": True,
                          "len_range": [2, 2],
                          "data_type": ["int", "float"]
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
                  },
                  steps=[
                      {
                          **StepTemplate.data_source
                      },
                      {
                          **StepTemplate.fields,
                          "args": [
                              {
                                  **StepTemplate.fields["args"][0],
                                  "len_range": [2, 2],
                                  "value_type": ["int", "float"],
                              }
                          ],
                      }
                  ])


class DimensionReduction(object):
    # 没有统一格式
    steps = [

    ]

    PCA_ObjectId = ObjectId("5980149d8be34d34da32c172")
    PCA = Toolkit(name="降维PCA-主成分分析算法",
                  description="计算所选数据集合(多为数据)的降维，default自动降维，输入k可降到k维",
                  category=3,
                  entry_function="dimension_reduction_PCA",
                  target_py_code=inspect.getsource(toolkit_orig.dimension_reduction_PCA),
                  parameter_spec={
                      "data": {
                          "name": "input",
                          "type": {
                              "key": "select_box",
                              "des": "nD tensor with shape: (batch_size, ..., "
                                     "input_dim). The most common situation would be a "
                                     "2D input with shape (batch_size, input_dim).",
                              "range": None
                          },
                          "default": None,
                          "required": True,
                          "len_range": [2, None],
                          "data_type": ["int", "float"]
                      },
                      "args": [
                          {
                              "name": "n_components",
                              "type": {
                                  "key": "int",
                                  "des": "the number of clustering numbers",
                                  "range": [1, None]
                              },
                              "default": "mle",
                              "required": True
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
                  },
                  steps=[
                      {
                          **StepTemplate.data_source
                      },
                      {
                          **StepTemplate.fields,
                          "args": [
                              {
                                  **StepTemplate.fields["args"][0],
                                  "len_range": [2, None],
                                  "value_type": ["int", "float"],
                                  "require": True
                              }
                          ],
                      }
                  ]
                  )

    TSNE_ObjectId = ObjectId("5980149d8be34d34da32c174")
    TSNE = Toolkit(name="降维TSNE-t_分布邻域嵌入算法",
                   description="计算所选数据集合(多维数据)的降维，default自动降维，输入k可降到k维，通常为了方便可视化，降至2维",
                   category=3,
                   entry_function="dimension_reduction_TSNE",
                   target_py_code=inspect.getsource(toolkit_orig.dimension_reduction_TSNE),
                   parameter_spec={
                       "data": {
                           "name": "input",
                           "type": {
                               "key": "select_box",
                               "des": "nD tensor with shape: (batch_size, ..., "
                                      "input_dim). The most common situation would be a "
                                      "2D input with shape (batch_size, input_dim).",
                               "range": None
                           },
                           "default": None,
                           "required": True,
                           "len_range": [2, None],
                           "data_type": ["int", "float"]
                       },
                       "args": [
                           {
                               "name": "n_components",
                               "type": {
                                   "key": "int",
                                   "des": "the number of clustering numbers",
                                   "range": [1, None]
                               },
                               "default": 2,
                               "required": True
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
                   },
                   steps=[
                       {
                           **StepTemplate.data_source
                       },
                       {
                           **StepTemplate.fields,
                           "args": [
                               {
                                   **StepTemplate.fields["args"][0],
                                   "len_range": [2, None],
                                   "value_type": ["int", "float"],
                                   "require": True
                               }
                           ],
                       },
                       {
                           **StepTemplate.parameters,
                           "args": [
                               {
                                   **SPEC.ui_spec["input"],
                                   "name": "n_components",
                                   "display_name": "n_components",
                                   "value_type": "int",
                                   "range": [1, None],
                                   "des": "the number of clustering numbers",
                                   "value": 2,
                                   "required": True,
                               }
                           ]
                       }
                   ]
                   )

    lda_ObjectId = ObjectId("5980149d8be34d34da32c1a2")
    lda = Toolkit(name="线性判别分析法（LDA）",
                  description="线性判别分析法，返回降维后的数据，参数n_components为降维后的维数",
                  category=3,
                  entry_function="lda",
                  target_py_code=inspect.getsource(preprocess_orig.lda),
                  parameter_spec={
                      "data": {
                          "name": "input",
                          "type": {
                              "key": "transfer_box",
                              "des": "nD tensor with shape: (batch_size, ..., "
                                     "input_dim). The most common situation would be a "
                                     "2D input with shape (batch_size, input_dim).",
                              "range": None
                          },
                          "default": None,
                          "required": True,
                          "x_len_range": [2, None],
                          "y_len_range": [1, 1],

                          "x_data_type": ["int", "float"],
                          "y_data_type": ["int", "float"]
                      },
                      "args": [
                          {
                              "name": "n_features",
                              "type": {
                                  "key": "int",
                                  "des": "the number of de-features",
                                  "range": [1, None]
                              },
                              "default": 2,
                              "required": True
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
                  },
                  steps=[
                      {
                          **StepTemplate.data_source
                      },
                      {
                          **StepTemplate.feature_fields,
                          "args": [
                              {
                                  **SPEC.ui_spec["multiple_choice"],
                                  "name": "fields",
                                  "des": "",
                                  "len_range": [2, None],
                                  "value_type": ["int", "float"],
                              }
                          ],

                      },
                      {
                          **StepTemplate.label_fields,
                          "args": [
                              {
                                  **SPEC.ui_spec["multiple_choice"],
                                  "name": "fields",
                                  "des": "",
                                  "len_range": [1, 1],
                                  "value_type": ["int", "float"],
                              }
                          ],

                      },
                      {
                          **StepTemplate.parameters,
                          "args": [
                              {
                                  **SPEC.ui_spec["input"],
                                  "name": "n_features",
                                  "display_name": "n_features",
                                  "value_type": "int",
                                  "des": "the number of de-features",
                                  "default": 2,
                                  "required": True,
                                  "range": [1, None]
                              }
                          ]
                      }
                  ])


class DataTransform(object):
    standard_scaler_ObjectId = ObjectId("5980149d8be34d34da32c184")
    standard_scaler = Toolkit(name="无量纲化-正态分布",
                              description="标准化，基于特征矩阵的列，将特征值转换至服从标准正态分布",
                              category=2,
                              entry_function="standard_scaler",
                              target_py_code=inspect.getsource(preprocess_orig.standard_scaler),
                              parameter_spec={
                                  "data": {
                                      "name": "input",
                                      "type": {
                                          "key": "select_box",
                                          "des": "nD tensor with shape: (batch_size, ..., "
                                                 "input_dim). The most common situation would be a "
                                                 "2D input with shape (batch_size, input_dim).",
                                          "range": None
                                      },
                                      "default": None,
                                      "required": True,
                                      "len_range": [1, None],
                                      "data_type": ["int", "float"]
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
                                      "args": [
                                          {
                                              **StepTemplate.fields["args"][0],
                                              "len_range": [1, None],
                                              "value_type": ["int", "float"],
                                              "require": True
                                          }
                                      ],
                                  }]
                              )

    min_max_scaler_ObjectId = ObjectId("5980149d8be34d34da32c186")
    min_max_scaler = Toolkit(name="无量纲化-(0, 1)分布",
                             description="区间缩放，基于最大最小值，将特征值转换到[0, 1]区间上",
                             category=2,
                             entry_function="min_max_scaler",
                             target_py_code=inspect.getsource(preprocess_orig.min_max_scaler),
                             parameter_spec={
                                 "data": {
                                     "name": "input",
                                     "type": {
                                         "key": "select_box",
                                         "des": "nD tensor with shape: (batch_size, ..., "
                                                "input_dim). The most common situation would be a "
                                                "2D input with shape (batch_size, input_dim).",
                                         "range": None
                                     },
                                     "default": None,
                                     "required": True,
                                     "len_range": [1, None],
                                     "data_type": ["int", "float"]
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
                                     "args": [
                                         {
                                             **StepTemplate.fields["args"][0],
                                             "len_range": [1, None],
                                             "value_type": ["int", "float"],
                                             "require": True
                                         }
                                     ],
                                 }]
                             )

    normalizer_ObjectId = ObjectId("5980149d8be34d34da32c188")
    normalizer = Toolkit(name="归一化",
                         description="基于特征矩阵的行，将样本向量转换为单位向量",
                         category=2,
                         entry_function="normalizer",
                         target_py_code=inspect.getsource(preprocess_orig.normalizer),
                         parameter_spec={
                             "data": {
                                 "name": "input",
                                 "type": {
                                     "key": "select_box",
                                     "des": "nD tensor with shape: (batch_size, ..., "
                                            "input_dim). The most common situation would be a "
                                            "2D input with shape (batch_size, input_dim).",
                                     "range": None
                                 },
                                 "default": None,
                                 "required": True,
                                 "len_range": [2, None],
                                 "data_type": ["int", "float"]
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
                                 "args": [
                                     {
                                         **StepTemplate.fields["args"][0],
                                         "len_range": [2, None],
                                         "value_type": ["int", "float"]
                                     }
                                 ],

                             }
                         ])

    binarizer_ObjectId = ObjectId("5980149d8be34d34da32c18a")
    binarizer = Toolkit(name="二值化",
                        description="基于给定阈值，将定量特征按阈值划分",
                        category=2,
                        entry_function="binarizer",
                        target_py_code=inspect.getsource(preprocess_orig.binarizer),
                        parameter_spec={
                            "data": {
                                "name": "input",
                                "type": {
                                    "key": "select_box",
                                    "des": "nD tensor with shape: (batch_size, ..., "
                                           "input_dim). The most common situation would be a "
                                           "2D input with shape (batch_size, input_dim).",
                                    "range": None
                                },
                                "default": None,
                                "required": True,
                                "len_range": [1, 1],
                                "data_type": ["int", "float"]
                            },
                            "args": [
                                {
                                    "name": "threshold",
                                    "type": {
                                        "key": "float",
                                        "des": "the threshold to judge if positive of negative",
                                        "range": [None, None]
                                    },
                                    "default": 0,
                                    "required": True
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
                        },
                        steps=[
                            {
                                **StepTemplate.data_source
                            },
                            {
                                **StepTemplate.fields,
                                "args": [
                                    {
                                        **StepTemplate.fields["args"][0],
                                        "len_range": [1, 1],
                                        "value_type": ["int", "float"],
                                    }
                                ],
                            },
                            {
                                **StepTemplate.parameters,
                                "args": [
                                    {
                                        **SPEC.ui_spec["input"],
                                        "name": "threshold",
                                        "display_name": "threshold",
                                        "value_type": "float",
                                        "des": "the threshold to judge if positive of negative",
                                        "value": 0,
                                        "required": True,
                                    }
                                ]
                            },
                        ]
                        )

    one_hot_encoder_ObjectId = ObjectId("5a0aa28ad845c0dd02bd872d")
    one_hot_encoder = Toolkit(name="哑编码",
                              description="将定性数据编码为定量数据",
                              category=2,
                              entry_function="one_hot_encoder",
                              target_py_code=inspect.getsource(preprocess_orig.one_hot_encoder),
                              parameter_spec={
                                  "data": {
                                      "name": "input",
                                      "type": {
                                          "key": "select_box",
                                          "des": "nD tensor with shape: (batch_size, ..., "
                                                 "input_dim). The most common situation would be a "
                                                 "2D input with shape (batch_size, input_dim).",
                                          "range": None
                                      },
                                      "default": None,
                                      "required": True,
                                      "len_range": [1, 1],
                                      "data_type": ["int", "float"]
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
                                      "args": [
                                          {
                                              **StepTemplate.fields["args"][0],
                                              "len_range": [1, 1],
                                              "value_type": ["int", "float"],
                                          }
                                      ],
                                  }
                              ]
                              )

    imputer_ObjectId = ObjectId("5980149d8be34d34da32c18e")
    imputer = Toolkit(name="缺失值计算",
                      description="计算缺失值，缺失值可填充为均值等",
                      category=2,
                      entry_function="imputer",
                      target_py_code=inspect.getsource(preprocess_orig.imputer),
                      parameter_spec={
                          "data": {
                              "name": "input",
                              "type": {
                                  "key": "select_box",
                                  "des": "nD tensor with shape: (batch_size, ..., "
                                         "input_dim). The most common situation would be a "
                                         "2D input with shape (batch_size, input_dim).",
                                  "range": None
                              },
                              "default": None,
                              "required": True,
                              "len_range": [1, None],
                              "data_type": ["int", "float"]
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
                              "args": [
                                  {
                                      **StepTemplate.fields["args"][0],
                                      "len_range": [1, None],
                                      "value_type": ["int", "float"],
                                  }
                              ],
                          }
                      ]
                      )

    polynomial_features_ObjectId = ObjectId("5980149d8be34d34da32c190")
    polynomial_features = Toolkit(name="多项式数据转换",
                                  description="多项式数据转换, 默认为两次",
                                  category=2,
                                  entry_function="polynomial_features",
                                  target_py_code=inspect.getsource(
                                      preprocess_orig.polynomial_features),
                                  parameter_spec={
                                      "data": {
                                          "name": "input",
                                          "type": {
                                              "key": "select_box",
                                              "des": "nD tensor with shape: (batch_size, ..., "
                                                     "input_dim). The most common situation would be a "
                                                     "2D input with shape (batch_size, input_dim).",
                                              "range": None
                                          },
                                          "default": None,
                                          "required": True,
                                          "len_range": [1, None],
                                          "data_type": ["int", "float"]
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
                                          "args": [
                                              {
                                                  **StepTemplate.fields["args"][0],
                                                  "len_range": [1, None],
                                                  "value_type": ["int", "float"],
                                              }
                                          ],
                                      }
                                  ])


class Others(object):
    MIC_ObjectId = ObjectId("5980178f8be34d3806c9e43b")
    MIC = Toolkit(name="最大互信息数",
                  description="计算所选数据集合的最大互信息数, 表达第一个所选值域与其他值域变量之间的相关系数",
                  category=4,
                  entry_function="toolkit_mic",
                  target_py_code=inspect.getsource(toolkit_orig.toolkit_mic),
                  parameter_spec={
                      "data": {
                          "name": "input",
                          "type": {
                              "key": "select_box",
                              "des": "nD tensor with shape: (batch_size, ..., "
                                     "input_dim). The most common situation would be a "
                                     "2D input with shape (batch_size, input_dim).",
                              "range": None
                          },
                          "default": None,
                          "required": True,
                          "len_range": [2, None],
                          "data_type": ["int", "float"]
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
                  },
                  steps=[
                      {
                          **StepTemplate.data_source
                      },
                      {
                          **StepTemplate.fields,
                          "args": [
                              {
                                  **StepTemplate.fields["args"][0],
                                  "len_range": [2, None],
                                  "value_type": ["int", "float"],
                                  "required": True,
                              }
                          ],
                      }
                  ]
                  )

    DUM_ObjectId = ObjectId("598acb388be34d3600cf84b0")
    DUM = Toolkit(name="类别转数字",
                  description="将一组类别属性的数据，转化成几列数字组成的矩阵",
                  category=2,
                  entry_function="get_dummy",
                  target_py_code=inspect.getsource(preprocess_orig.get_dummy),
                  parameter_spec={
                      "data": {
                          "name": "input",
                          "type": {
                              "key": "select_box",
                              "des": "nD tensor with shape: (batch_size, ..., "
                                     "input_dim). The most common situation would be a "
                                     "2D input with shape (batch_size, input_dim).",
                              "range": None
                          },
                          "default": None,
                          "required": True,
                          "len_range": [1, 1],
                          "data_type": ["int", "float", "str"]
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
                  },
                  steps=[
                      {
                          **StepTemplate.data_source
                      },
                      {
                          **StepTemplate.fields,
                          "args": [
                              {
                                  **StepTemplate.fields["args"][0],
                                  "len_range": [1, 1],
                                  "value_type": ["int", "float", "str"],
                                  "required": True,
                              }
                          ],
                      }
                  ])

    CUT_ObjectId = ObjectId("598acb388be34d3600cf84b2")
    CUT = Toolkit(name="数字转类别方法",
                  description="将一组数据，转化成类别",
                  category=2,
                  entry_function="pandas_cut",
                  target_py_code=inspect.getsource(preprocess_orig.pandas_cut),
                  parameter_spec={
                      "data": {
                          "name": "input",
                          "type": {
                              "key": "select_box",
                              "des": "nD tensor with shape: (batch_size, ..., "
                                     "input_dim). The most common situation would be a "
                                     "2D input with shape (batch_size, input_dim).",
                              "range": None
                          },
                          "default": None,
                          "required": True,
                          "len_range": [1, 1],
                          "data_type": ["int", "float", "string"]
                      },
                      "args": [
                          {
                              "name": "bins",
                              "type": {
                                  "key": "int",
                                  "des": "the number of bins",
                                  "range": [2, None]
                              },
                              "default": 3,
                              "required": True
                          },
                          {
                              "name": "labels",
                              "type": {
                                  "key": "string_m",
                                  "des": "multiple labels",
                              },
                              "default": None,
                              "len_range": None,
                              "required": False
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
                  },
                  steps=[
                      {
                          **StepTemplate.data_source
                      },
                      {
                          **StepTemplate.fields,
                          "args": [
                              {
                                  **StepTemplate.fields["args"][0],
                                  "len_range": [1, 1],
                                  "value_type": ["int", "float", "str"],
                              }
                          ],
                      },
                      {
                          **StepTemplate.parameters,
                          "args": [
                              {
                                  **SPEC.ui_spec["input"],
                                  "name": "bins",
                                  "display_name": "bins",
                                  "value_type": "int",
                                  "range": [2, None],
                                  "des": "the number of bins",
                                  "value": 3,
                                  "required": True,
                              },
                              {
                                  **SPEC.ui_spec["multiple_input"],
                                  "name": "labels",
                                  "display_name": "labels",
                                  "value_type": "str",
                                  "des": "multiple labels",
                                  # "value": ,
                              }
                          ]
                      },
                  ]
                  )
    TMP_ObjectId = ObjectId("599446648be34dbbdd677209")
    TMP = Toolkit(name="字符串转数字类别",
                  description="将一组类别属性的数据，转化为数字的类别",
                  category=2,
                  entry_function="str_to_categories",
                  target_py_code=inspect.getsource(preprocess_orig.str_to_categories),
                  parameter_spec={
                      "data": {
                          "name": "input",
                          "type": {
                              "key": "select_box",
                              "des": "nD tensor with shape: (batch_size, ..., "
                                     "input_dim). The most common situation would be a "
                                     "2D input with shape (batch_size, input_dim).",
                              "range": None
                          },
                          "default": None,
                          "required": True,
                          "len_range": [1, 1],
                          "data_type": ["str"]
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
                  },
                  steps=[
                      {
                          **StepTemplate.data_source
                      },
                      {
                          **StepTemplate.fields,
                          "args": [
                              {
                                  **StepTemplate.fields["args"][0],
                                  "len_range": [1, 1],
                                  "value_type": ["str"],
                                  "required": True,
                              }
                          ],
                      }
                  ]
                  )


class DataExploreToolkit(object):
    KMEAN_ObjectId = ObjectId("5980149d8be34d34da32c170")
    KMEAN = Toolkit(name="K平均数算法",
                    description="计算所选数据集合的k-mean, 把一个把数据空间划分为k个子集",
                    category=0,
                    entry_function="k_mean",
                    target_py_code=inspect.getsource(toolkit_orig.k_mean),
                    parameter_spec={
                        "data": {
                            "name": "input",
                            "type": {
                                "key": "select_box",
                                "des": "nD tensor with shape: (batch_size, ..., "
                                       "input_dim). The most common situation would be a "
                                       "2D input with shape (batch_size, input_dim).",
                                "range": None
                            },
                            "default": None,
                            "required": True,
                            "len_range": [1, None],
                            "data_type": ["int", "float"]
                        },
                        "args": [
                            {
                                "name": "n_clusters",
                                "type": {
                                    "key": "int",
                                    "des": "the number of clustering numbers",
                                    "range": [2, None]
                                },
                                "default": 2,
                                "required": True
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
                            "args": [
                                {
                                    **StepTemplate.fields["args"][0],
                                    "len_range": [1, None],
                                    "value_type": ["int", "float"],
                                }
                            ],
                        },
                        {
                            **StepTemplate.parameters,
                            "args": [
                                {
                                    **SPEC.ui_spec["input"],
                                    "name": "k",
                                    "display_name": "k",
                                    "value_type": "int",
                                    "range": [2, None],
                                    "des": "the number of clustering numbers",
                                    "default": 3,
                                    "value": 2,
                                    "required": True,
                                }
                            ]
                        },
                    ]
                    )

    CORRELATION_ObjectId = ObjectId("5980149d8be34d34da32c180")
    CORRELATION = Toolkit(name="数据互相关",
                          description="返回数据correlation",
                          category=4,
                          entry_function="toolkit_correlation",
                          target_py_code=inspect.getsource(toolkit_orig.toolkit_correlation),
                          parameter_spec={
                              "data": {
                                  "name": "input",
                                  "type": {
                                      "key": "select_box",
                                      "des": "nD tensor with shape: (batch_size, ..., "
                                             "input_dim). The most common situation would be a "
                                             "2D input with shape (batch_size, input_dim).",
                                      "range": None
                                  },
                                  "default": None,
                                  "required": True,
                                  "len_range": [2, 2],
                                  "data_type": ["int", "float"]
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
                                  "args": [
                                      {
                                          **SPEC.ui_spec["multiple_choice"],
                                          "name": "fields",
                                          "des": "",
                                          "len_range": [2, 2],
                                      }
                                  ],
                              }
                          ])


class DataQualityImproveToolkit(object):
    """
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


    """
    add_columns_append_ObjectId = ObjectId("5a014c9dd845c0523f3a9ff1")
    add_columns_append = Toolkit(
        name="合并添加列",
        description="通过其他数据表数据添加列",
        category=-1,
        entry_function="add_columns_append",
        target_py_code=inspect.getsource(preprocess_orig.add_columns_append),
        result_spec={
            "args": [
            ]
        },
        steps=[
            {
                **StepTemplate.data_source,
                "name": "target_datasource",
                "display_name": "select target data source",
            },

            {
                **StepTemplate.data_source,
                "name": "from_datasource",
                "display_name": "select from data source",
            },
            {
                "name": "select_index",
                "display_name": "Select index",
                "args": [
                    {
                        **SPEC.ui_spec["multiple_choice"],
                        "name": "target_datasource_index",
                        "display_name": "target_datasource_index",
                        "range": {
                            "type": "from_step",
                            "step_name": "target_datasource",
                            "step_index": 0,
                            "arg_index": 0,
                            "value_name": "fields"
                        },
                    },

                ]
            },
            {
                **StepTemplate.fields,
                "name": "from_fields",
                "display_name": "select added fields",
                "args": [
                    {
                        **SPEC.ui_spec["multiple_choice"],
                        "name": "fields",
                        "des": "",
                        "range": {
                            "type": "from_step",
                            "step_name": "from_datasource",
                            "step_index": 1,
                            "arg_index": 0,
                            "value_name": "fields"
                        }
                    }
                ],

            },
            {
                **StepTemplate.parameters,
                "args": [
                    {
                        **SPEC.ui_spec["choice"],
                        "name": "exception_handing",
                        "display_name": "exception handing",
                        "des": "action after the row without index of from datasource",

                        "range": [
                            "NAN",
                            "0",
                            "null",
                            "-1",
                        ],
                        "default": "NAN",

                    }
                ]
            }
        ]
    )

    add_row_append_ObjectId = ObjectId("5a02cb1cd845c01d60bde956")
    add_row_append = Toolkit(
        name="合并添加行",
        description="通过其他数据表数据添加行",
        category=-1,
        entry_function="add_rows_append",
        target_py_code=inspect.getsource(preprocess_orig.add_rows_append),
        result_spec={
            "args": []
        },
        steps=[
            {
                **StepTemplate.data_source,
                "name": "target_datasource",
                "display_name": "select target data source",
            },

            {
                **StepTemplate.data_source,
                "name": "from_datasource",
                "display_name": "select from data source",
            },
            {
                **StepTemplate.parameters,
                "args": [
                    {
                        **SPEC.ui_spec["choice"],
                        "name": "exception_handing",
                        "display_name": "exception handling",
                        "des": "action after the row without index of from datasource",
                        "range": [
                            "NAN",
                            "0",
                            "null",
                            "-1",
                        ],
                        "default": "NAN",
                    }
                ]
            }
        ]
    )
    pass


class FeatureSelection(object):
    variance_threshold_ObjectId = ObjectId("5980149d8be34d34da32c192")
    variance_threshold = Toolkit(name="方差选择法",
                                 description="选取合适的特征，方差选择法",
                                 category=1,
                                 entry_function="variance_threshold",
                                 target_py_code=inspect.getsource(
                                     preprocess_orig.variance_threshold),
                                 parameter_spec={
                                     "data": {
                                         "name": "input",
                                         "type": {
                                             "key": "select_box",
                                             "des": "nD tensor with shape: (batch_size, ..., "
                                                    "input_dim). The most common situation would be a "
                                                    "2D input with shape (batch_size, input_dim).",
                                             "range": None
                                         },
                                         "default": None,
                                         "required": True,
                                         "len_range": [1, None],
                                         "data_type": ["int", "float"]
                                     },
                                     "args": [
                                         {
                                             "name": "threshold",
                                             "type": {
                                                 "key": "float",
                                                 "des": "the threshold to judge if positive of negative",
                                                 "range": [0, None]
                                             },
                                             "default": 1,
                                             "required": True
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
                                         "args": [
                                             {
                                                 **StepTemplate.fields["args"][0],
                                                 "len_range": [1, None],
                                                 "value_type": ["int", "float"],
                                                 # **SPEC.ui_spec["multiple_choice"],
                                                 # "name": "fields",
                                             }
                                         ],
                                     },
                                     {
                                         **StepTemplate.parameters,
                                         "args": [
                                             {
                                                 **SPEC.ui_spec["input"],
                                                 "name": "threshold",
                                                 "display_name": "threshold",
                                                 "value_type": "float",
                                                 "des": "the threshold to judge if "
                                                        "positive of negative",
                                                 "default": 1,
                                                 "required": True,
                                             }
                                         ]
                                     }
                                 ]
                                 )

    select_k_best_chi2_ObjectId = ObjectId("5980149d8be34d34da32c194")
    select_k_best_chi2 = Toolkit(name="卡方选择法",
                                 description="选择K个最好的特征，返回选择特征后的数据",
                                 category=1,
                                 entry_function="select_k_best_chi2",
                                 target_py_code=inspect.getsource(
                                     preprocess_orig.select_k_best_chi2),
                                 parameter_spec={
                                     "data": {
                                         "name": "input",
                                         "type": {
                                             "key": "transfer_box",
                                             "des": "nD tensor with shape: (batch_size, ..., "
                                                    "input_dim). The most common situation would be a "
                                                    "2D input with shape (batch_size, input_dim).",
                                             "range": None
                                         },
                                         "default": None,
                                         "required": True,
                                         "x_len_range": [2, None],
                                         "y_len_range": [1, 1],

                                         "x_data_type": ["int", "float"],
                                         "y_data_type": ["int", "float"]
                                     },
                                     "args": [
                                         {
                                             "name": "k",
                                             "type": {
                                                 "key": "int",
                                                 "des": "select k best, k is number of features selected",
                                                 "range": [1, None]
                                             },
                                             "default": 2,
                                             "required": True
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
                                         **StepTemplate.feature_fields,
                                         "args": [
                                             {
                                                 **SPEC.ui_spec["multiple_choice"],
                                                 "name": "fields",
                                                 "des": "",
                                                 "len_range": [2, None],
                                                 "value_type": ["int", "float"],
                                             }
                                         ],
                                     },
                                     {
                                         **StepTemplate.label_fields,
                                         "args": [
                                             {
                                                 **SPEC.ui_spec["multiple_choice"],
                                                 "name": "fields",
                                                 "des": "",
                                                 "len_range": [1, 1],
                                                 "value_type": ["int", "float"],
                                             }
                                         ],
                                     },
                                     {
                                         **StepTemplate.parameters,
                                         "args": [
                                             {
                                                 **SPEC.ui_spec["input"],
                                                 "name": "k",
                                                 "display_name": "k",
                                                 "value_type": "int",
                                                 "des": "select k best, k is number of "
                                                        "features selected",
                                                 "default": 2,
                                                 "required": True,
                                             }
                                         ]
                                     }
                                 ])

    select_k_best_pearson_ObjectId = ObjectId("5980149d8be34d34da32c196")
    select_k_best_pearson = Toolkit(name="相关系数选择法",
                                    description="选择K个最好的特征，返回选择特征后的数据",
                                    category=1,
                                    entry_function="select_k_best_pearson",
                                    target_py_code=inspect.getsource(
                                        preprocess_orig.select_k_best_pearson),
                                    parameter_spec={
                                        "data": {
                                            "name": "input",
                                            "type": {
                                                "key": "transfer_box",
                                                "des": "nD tensor with shape: (batch_size, ..., "
                                                       "input_dim). The most common situation would be a "
                                                       "2D input with shape (batch_size, input_dim).",
                                                "range": None
                                            },
                                            "default": None,
                                            "required": True,
                                            "x_len_range": [2, None],
                                            "y_len_range": [1, 1],

                                            "x_data_type": ["int", "float"],
                                            "y_data_type": ["int", "float"]
                                        },
                                        "args": [
                                            {
                                                "name": "k",
                                                "type": {
                                                    "key": "int",
                                                    "des": "select k best, k is number of features selected",
                                                    "range": [1, None]
                                                },
                                                "default": 2,
                                                "required": True
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
                                            **StepTemplate.feature_fields,
                                            "args": [
                                                {
                                                    **SPEC.ui_spec["multiple_choice"],
                                                    "name": "fields",
                                                    "des": "",
                                                    "len_range": [2, None],
                                                    "value_type": ["int", "float"],
                                                }
                                            ],
                                        },
                                        {
                                            **StepTemplate.label_fields,
                                            "args": [
                                                {
                                                    **SPEC.ui_spec["multiple_choice"],
                                                    "name": "fields",
                                                    "des": "",
                                                    "len_range": [1, 1],
                                                    "value_type": ["int", "float"],
                                                }
                                            ],
                                        },
                                        {
                                            **StepTemplate.parameters,
                                            "args": [
                                                {
                                                    **SPEC.ui_spec["input"],
                                                    "name": "k",
                                                    "display_name": "k",
                                                    "value_type": "int",
                                                    "des": "select k best, k is number of features selected",
                                                    "default": 2,
                                                    "required": True,
                                                }
                                            ]
                                        }
                                    ])

    select_k_best_mic_ObjectId = ObjectId("5980149d8be34d34da32c198")
    select_k_best_mic = Toolkit(name="互信息选择法",
                                description="选择K个最好的特征，返回选择特征后的数据",
                                category=1,
                                entry_function="select_k_best_mic",
                                target_py_code=inspect.getsource(preprocess_orig.select_k_best_mic),
                                parameter_spec={
                                    "data": {
                                        "name": "input",
                                        "type": {
                                            "key": "transfer_box",
                                            "des": "nD tensor with shape: (batch_size, ..., "
                                                   "input_dim). The most common situation would be a "
                                                   "2D input with shape (batch_size, input_dim).",
                                            "range": None
                                        },
                                        "default": None,
                                        "required": True,
                                        "x_len_range": [2, None],
                                        "y_len_range": [1, 1],

                                        "x_data_type": ["int", "float"],
                                        "y_data_type": ["int", "float"]
                                    },
                                    "args": [
                                        {
                                            "name": "k",
                                            "type": {
                                                "key": "int",
                                                "des": "select k best, k is number of features selected",
                                                "range": [1, None]
                                            },
                                            "default": 2,
                                            "required": True
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
                                        **StepTemplate.feature_fields,
                                        "args": [
                                            {
                                                **SPEC.ui_spec["multiple_choice"],
                                                "name": "fields",
                                                "des": "",
                                                "len_range": [2, None],
                                                "value_type": ["int", "float"],
                                            }
                                        ],

                                    },
                                    {
                                        **StepTemplate.label_fields,
                                        "args": [
                                            {
                                                **SPEC.ui_spec["multiple_choice"],
                                                "name": "fields",
                                                "des": "",
                                                "len_range": [1, 1],
                                                "value_type": ["int", "float"],
                                            }
                                        ],

                                    },
                                    {
                                        **StepTemplate.parameters,
                                        "args": [
                                            {
                                                **SPEC.ui_spec["input"],
                                                "name": "k",
                                                "display_name": "k",
                                                "value_type": "int",
                                                "des": "select k best, k is number of features selected",
                                                "default": 2,
                                                "value": 2,
                                                "required": True,
                                            }
                                        ]
                                    }
                                ])

    REF_ObjectId = ObjectId("5980149d8be34d34da32c19a")
    REF = Toolkit(name="递归特征消除法",
                  description="递归特征消除法, 返回特征选择后的数据, 参数estimator为基模型",
                  category=1,
                  entry_function="ref",
                  target_py_code=inspect.getsource(preprocess_orig.ref),
                  parameter_spec={
                      "data": {
                          "name": "input",
                          "type": {
                              "key": "transfer_box",
                              "des": "nD tensor with shape: (batch_size, ..., "
                                     "input_dim). The most common situation would be a "
                                     "2D input with shape (batch_size, input_dim).",
                              "range": None
                          },
                          "default": None,
                          "required": True,
                          "x_len_range": [2, None],
                          "y_len_range": [1, 1],

                          "x_data_type": ["int", "float"],
                          "y_data_type": ["int", "float"]
                      },
                      "args": [
                          {
                              "name": "n_features",
                              "type": {
                                  "key": "int",
                                  "des": "select k best, k is number of features selected",
                                  "range": [1, None]
                              },
                              "default": 2,
                              "required": True
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
                          **StepTemplate.feature_fields,
                          "args": [
                              {
                                  **SPEC.ui_spec["multiple_choice"],
                                  "name": "fields",
                                  "des": "",
                                  "len_range": [2, None],
                                  "value_type": ["int", "float"],
                              }
                          ],
                          "name": "feature_fields",
                          "display_name": "select x fields",

                      },
                      {
                          **StepTemplate.label_fields,
                          "args": [
                              {
                                  **SPEC.ui_spec["multiple_choice"],
                                  "name": "fields",
                                  "des": "",
                                  "len_range": [1, 1],
                                  "value_type": ["int", "float"],
                              }
                          ],

                      },
                      {
                          **StepTemplate.parameters,
                          "args": [
                              {
                                  **SPEC.ui_spec["input"],
                                  "name": "n_features",
                                  "display_name": "n_features",
                                  "value_type": "int",
                                  "des": "select k best, k is number of features selected",
                                  "default": 2,
                                  "required": True,
                              }
                          ]
                      }
                  ])

    select_from_model_lr_ObjectId = ObjectId("5980149d8be34d34da32c19c")
    select_from_model_lr = Toolkit(name="基于惩罚项的特征选择法",
                                   description="带L1惩罚项的逻辑回归作为基模型的特征选择, 属于带惩罚的基模型，除了筛选出特征，同时也降维",
                                   category=1,
                                   entry_function="select_from_model_lr",
                                   target_py_code=inspect.getsource(
                                       preprocess_orig.select_from_model_lr),
                                   parameter_spec={
                                       "data": {
                                           "name": "input",
                                           "type": {
                                               "key": "transfer_box",
                                               "des": "nD tensor with shape: (batch_size, ..., "
                                                      "input_dim). The most common situation would be a "
                                                      "2D input with shape (batch_size, input_dim).",
                                               "range": None
                                           },
                                           "default": None,
                                           "required": True,
                                           "x_len_range": [2, None],
                                           "y_len_range": [1, 1],

                                           "x_data_type": ["int", "float"],
                                           "y_data_type": ["int", "float"]
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
                                   },
                                   steps=[
                                       {
                                           **StepTemplate.data_source
                                       },
                                       {
                                           **StepTemplate.feature_fields,
                                           "args": [
                                               {
                                                   **SPEC.ui_spec["multiple_choice"],
                                                   "name": "fields",
                                                   "des": "",
                                                   "len_range": [2, None],
                                                   "value_type": ["int", "float"],
                                               }
                                           ],
                                           "name": "feature_fields",
                                           "display_name": "select x fields",

                                       },
                                       {
                                           **StepTemplate.label_fields,
                                           "args": [
                                               {
                                                   **SPEC.ui_spec["multiple_choice"],
                                                   "name": "fields",
                                                   "des": "",
                                                   "len_range": [1, 1],
                                                   "value_type": ["int", "float"],
                                               }
                                           ],

                                       }
                                   ])

    select_from_model_gbdt_ObjectId = ObjectId("5980149d8be34d34da32c19e")
    select_from_model_gbdt = Toolkit(name="基于树模型的特征选择法",
                                     description="基树模型中GBDT可用来作为基模型进行特征选择",
                                     category=1,
                                     entry_function="select_from_model_gbdt",
                                     target_py_code=inspect.getsource(
                                         preprocess_orig.select_from_model_gbdt),
                                     parameter_spec={
                                         "data": {
                                             "name": "input",
                                             "type": {
                                                 "key": "transfer_box",
                                                 "des": "nD tensor with shape: (batch_size, ..., "
                                                        "input_dim). The most common situation would be a "
                                                        "2D input with shape (batch_size, input_dim).",
                                                 "range": None
                                             },
                                             "default": None,
                                             "required": True,
                                             "x_len_range": [2, None],
                                             "y_len_range": [1, 1],

                                             "x_data_type": ["int", "float"],
                                             "y_data_type": ["int"]
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
                                     },
                                     steps=[
                                         {
                                             **StepTemplate.data_source
                                         },
                                         {
                                             **StepTemplate.feature_fields,
                                             "args": [
                                                 {
                                                     **SPEC.ui_spec["multiple_choice"],
                                                     "name": "fields",
                                                     "des": "",
                                                     "len_range": [2, None],
                                                     "value_type": ["int", "float"],
                                                 }
                                             ],
                                             "name": "feature_fields",
                                             "display_name": "select x fields",

                                         },
                                         {
                                             **StepTemplate.label_fields,
                                             "args": [
                                                 {
                                                     **SPEC.ui_spec["multiple_choice"],
                                                     "name": "fields",
                                                     "des": "",
                                                     "len_range": [1, 1],
                                                     "value_type": ["int"],
                                                 }
                                             ],

                                         }
                                     ])


class SimpleToolkit(object):
    SIMPLE_KMEAN_ObjectId = ObjectId("59f297cad845c05376f599c6")
    SIMPLE_KMEAN = Toolkit(name="简单的K平均数算法",
                           description="计算所选数据集合的k-mean, 把一个把数据空间划分为k个子集",
                           category=0,
                           entry_function="k_mean",
                           target_py_code=inspect.getsource(toolkit_orig.k_mean),
                           parameter_spec={
                               "data": {
                                   "name": "input",
                                   "type": {
                                       "key": "select_box",
                                       "des": "nD tensor with shape: (batch_size, ..., "
                                              "input_dim). The most common situation would be a "
                                              "2D input with shape (batch_size, input_dim).",
                                       "range": None
                                   },
                                   "default": None,
                                   "required": True,
                                   "len_range": [1, None],
                                   "data_type": ["int", "float"]
                               },
                               "args": [
                                   {
                                       "name": "n_clusters",
                                       "type": {
                                           "key": "int",
                                           "des": "the number of clustering numbers",
                                           "range": [2, None]
                                       },
                                       "default": 2,
                                       "required": True
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
                                   "args": [
                                       {
                                           **StepTemplate.fields["args"][0],
                                           "len_range": [1, None],
                                           "value_type": ["int", "float"],
                                           # **SPEC.ui_spec["multiple_choice"],
                                           # "name": "fields",
                                       }
                                   ],
                               },
                               {
                                   **StepTemplate.parameters,
                                   "args": [
                                       {
                                           **SPEC.ui_spec["input"],
                                           "name": "k",
                                           "display_name": "k",
                                           "value_type": "int",
                                           "range": [2, None],
                                           "des": "the number of clustering numbers",
                                           "value": 2,
                                           "default": 2,
                                           "required": True,
                                       }
                                   ]
                               }
                           ]
                           )
    pass


class ToolkitDictCategory(object):
    """
    针对 toolkit 的分类
    """

    data_explore = [
        {
            "_id": MathToolkit.AVG_ObjectId,
            "object": MathToolkit.AVG
        },
        {
            "_id": MathToolkit.MEDIAN_ObjectId,
            "object": MathToolkit.MEDIAN
        },
        {
            "_id": MathToolkit.MODE_ObjectId,
            "object": MathToolkit.MODE
        },
        {
            "_id": MathToolkit.SMA_ObjectId,
            "object": MathToolkit.SMA
        },
        {
            "_id": MathToolkit.RANGE_ObjectId,
            "object": MathToolkit.RANGE
        },
        {
            "_id": MathToolkit.STD_ObjectId,
            "object": MathToolkit.STD
        },
        {
            "_id": MathToolkit.VAR_ObjectId,
            "object": MathToolkit.VAR
        },
        {
            "_id": MathToolkit.N_ObjectId,
            "object": MathToolkit.N
        },
        {
            "_id": MathToolkit.IQR_ObjectId,
            "object": MathToolkit.IQR
        },
        {
            "_id": MathToolkit.CV_ObjectId,
            "object": MathToolkit.CV
        },
        {
            "_id": MathToolkit.MAX_ObjectId,
            "object": MathToolkit.MAX
        },
        {
            "_id": MathToolkit.MIN_ObjectId,
            "object": MathToolkit.MIN
        },
        {
            "_id": MathToolkit.PEARSON_ObjectId,
            "object": MathToolkit.PEARSON
        },
        {
            "_id": MathToolkit.COV_ObjectId,
            "object": MathToolkit.COV
        },
        {
            "_id": Others.MIC_ObjectId,
            "object": Others.MIC
        },
        {
            "_id": DataExploreToolkit.KMEAN_ObjectId,
            "object": DataExploreToolkit.KMEAN
        },
        {
            "_id": DataExploreToolkit.CORRELATION_ObjectId,
            "object": DataExploreToolkit.CORRELATION
        }
    ]

    data_quality_improve = [
        {
            "_id": DimensionReduction.PCA_ObjectId,
            "object": DimensionReduction.PCA
        },
        {
            "_id": DimensionReduction.TSNE_ObjectId,
            "object": DimensionReduction.TSNE
        },
        {
            "_id": DimensionReduction.lda_ObjectId,
            "object": DimensionReduction.lda
        },


        {
            "_id": DataTransform.standard_scaler_ObjectId,
            "object": DataTransform.standard_scaler
        },
        {
            "_id": DataTransform.min_max_scaler_ObjectId,
            "object": DataTransform.min_max_scaler
        },
        {
            "_id": DataTransform.normalizer_ObjectId,
            "object": DataTransform.normalizer
        },
        {
            "_id": DataTransform.binarizer_ObjectId,
            "object": DataTransform.binarizer
        },
        {
            "_id": DataTransform.one_hot_encoder_ObjectId,
            "object": DataTransform.one_hot_encoder
        },
        {
            "_id": DataTransform.imputer_ObjectId,
            "object": DataTransform.imputer
        },
        {
            "_id": DataTransform.polynomial_features_ObjectId,
            "object": DataTransform.polynomial_features
        },


        {
            "_id": Others.DUM_ObjectId,
            "object": Others.DUM
        },
        {
            "_id": Others.CUT_ObjectId,
            "object": Others.CUT
        },
        {
            "_id": Others.TMP_ObjectId,
            "object": Others.TMP
        }

        ,
        {
            "_id": DataQualityImproveToolkit.add_columns_append_ObjectId,
            "object": DataQualityImproveToolkit.add_columns_append
        },
        {
            "_id": DataQualityImproveToolkit.add_row_append_ObjectId,
            "object": DataQualityImproveToolkit.add_row_append
        }
    ]

    feature_selection = [
        {
            "_id": FeatureSelection.variance_threshold_ObjectId,
            "object": FeatureSelection.variance_threshold
        },
        {
            "_id": FeatureSelection.select_k_best_chi2_ObjectId,
            "object": FeatureSelection.select_k_best_chi2
        },
        {
            "_id": FeatureSelection.select_k_best_pearson_ObjectId,
            "object": FeatureSelection.select_k_best_pearson
        },
        {
            "_id": FeatureSelection.select_k_best_mic_ObjectId,
            "object": FeatureSelection.select_k_best_mic
        },
        {
            "_id": FeatureSelection.REF_ObjectId,
            "object": FeatureSelection.REF
        },
        {
            "_id": FeatureSelection.select_from_model_lr_ObjectId,
            "object": FeatureSelection.select_from_model_lr
        },
        {
            "_id": FeatureSelection.select_from_model_gbdt_ObjectId,
            "object": FeatureSelection.select_from_model_gbdt
        }
    ]
    
    simple = [{
        "_id": SimpleToolkit.SIMPLE_KMEAN_ObjectId,
        "object": SimpleToolkit.SIMPLE_KMEAN
    }]

    all = data_explore + data_quality_improve + feature_selection + simple
    

def loop_update(toolkit_dict):
    user = user_business.get_by_user_ID("system")
    for toolkit in toolkit_dict:
        if not toolkit["_id"]:
            # create toolkit, then add _id to TOOLKIT_DICT
            print("create toolkit: ", toolkit["object"].name)
            new_toolkit_obj = toolkit_repo.create(toolkit["object"])
            print("new toolkit objectid: ", new_toolkit_obj.id)
            ownership_business.add(user, False, toolkit=new_toolkit_obj)
        else:
            print("update toolkit: ", toolkit["object"].name)

            toolkit_obj = get_by_toolkit_id(toolkit["_id"])
            attributes = ["name", "description", "category", "result_form", "entry_function",
                          "target_py_code", "parameter_spec", "result_spec", "steps"]
            for attribute in attributes:
                if hasattr(toolkit["object"], attribute):
                    toolkit_obj[attribute] = toolkit["object"][attribute]
            toolkit_obj.save()


def update_all_toolkit():
    toolkit_dict = ToolkitDictCategory.all
    length = len(toolkit_dict)
    print("number of toolkits", length)
    loop_update(toolkit_dict)


if __name__ == "__main__":
    # update_toolkit()
    update_all_toolkit()
    pass
