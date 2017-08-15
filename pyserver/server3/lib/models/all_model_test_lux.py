# from server3.lib.models.custom_model import *
from server3.lib.models import *
from server3.business import staging_data_set_business
import pandas as pd
from sklearn.datasets.samples_generator import make_blobs
import numpy as np


##############################
#  测试聚类：

# 生成测试数据
# X, y = make_blobs(n_samples=20, centers=2,
#                   random_state=2, cluster_std=0.60, n_features=2)
#
# custom_feature = pd.DataFrame(data=np.c_[X],
#                               columns=['f1', 'f2'])
# custom_label = pd.DataFrame(data=y,
#                             columns=['target'])

# 测试 GMM
#
# input = {
#     'model_name': 'gmm',
#     'df_fetures': custom_feature,
#     'df_labels': None,
# }
#
# params = {
#     'estimator': {
#         'args': {
#             "num_clusters": 2,
#             "random_seed": 5,
#             "covariance_type": "diag",
#             "update_params": ["w","m","c"]
#         }
#     },
#     'fit': {
#         "args": {
#             "steps": 30
#         }
#     },
#     'evaluate': {
#         'args': {
#             'steps': 1
#         }
#     }
# }
#
# sds = staging_data_set_business.get_by_id('595cb76ed123ab59779604c3')
#
# result = custom_model(params, gmm_cluster_model_fn, input, result_sds=sds)
# print(result)


# 测试 kmeans

# input = {
#     'model_name': 'kmeans',
#     'df_fetures': custom_feature,
#     'df_labels': None,
# }
#
# params = {
#     'estimator': {
#         'args': {
#             "num_clusters":2,
#             "random_seed":5,
#             "use_mini_batch":False,
#             "mini_batch_steps_per_iteration":1,
#             "kmeans_plus_plus_num_retries":2,
#             "relative_tolerance":None,
#         }
#     },
#     'fit': {
#         "args": {
#             "steps": 30
#         }
#     },
#     'evaluate': {
#         'args': {
#             'steps': 1
#         }
#     }
# }
#
# sds = staging_data_set_business.get_by_id('595cb76ed123ab59779604c3')
# from server3.lib.models.kmeans_cluster import kmeans_cluster_model_fn
# result = custom_model(params, kmeans_cluster_model_fn, input, result_sds=sds)
# print(result)



#######################
# 测试 多 分类：

# # 生成测试数据
# import numpy as np
# import pandas as pd
# from sklearn.datasets import load_iris
#
# iris = load_iris()
# iris_feature = pd.DataFrame(data= np.c_[iris['data']],
#                      columns= ["sepal_length","sepal_width","petal_length","petal_width"])
#
# iris_label = pd.DataFrame(data= iris['target'],
#                      columns= ['target'])


# # # # 测试 Random forest
# input = {
#     'model_name': 'Randomforest',
#     'df_features': iris_feature,
#     'df_labels': iris_label,
# }
#
# params = {
#     'estimator': {
#         'args': {
#             "weights_name":None,
#             "keys_name":None,
#             "num_classes":3,
#             "num_features":4,
#             "num_trees":3,
#             "max_nodes":1000,
#             "early_stopping_rounds":100,
#             "regression":False,
#             "split_after_samples":20
#         }
#     },
#     'fit': {
#         "args": {
#             "steps": 300
#         }
#     },
#     'evaluate': {
#         'args': {
#             'steps': 1
#         }
#     }
# }
# #
# sds = staging_data_set_business.get_by_id('595cb76ed123ab59779604c3')
# from server3.lib.models.randomforest import random_forest_model_fn
# result = custom_model(params, random_forest_model_fn, input, result_sds=sds)
# print(result)
#
#
# # # 测试 Linear_classifier
#
# input = {
#     'model_name': 'Linear_classifier',
#     'df_features': iris_feature,
#     'df_labels': iris_label,
# }
# params = {
#     'estimator': {
#         'args': {
#             "dimension": 4,
#             "n_classes": 3,
#             "weight_column_name": None,
#             "gradient_clip_norm": None,
#             "enable_centered_bias": False,
#             "_joint_weight": False,
#             "label_keys": None,
#         }
#     },
#     'fit': {
#         "args": {
#             "steps": 300
#         }
#     },
#     'evaluate': {
#         'args': {
#             'steps': 1
#         }
#     }
# }
#
# sds = staging_data_set_business.get_by_id('595cb76ed123ab59779604c3')
# from server3.lib.models.linear_classifier import linear_classifier_model_fn
# result = custom_model(params, linear_classifier_model_fn, input, result_sds=sds)
# print(result)

#################
# 测试 二 分类：

# 生成测试数据
# import numpy as np
# import pandas as pd
# from sklearn.datasets import load_iris
#
# iris = load_iris()
#
# ids = np.where((iris.target == 0) | (iris.target == 1))
#
#
# train_x = iris.data[ids]
# train_y = iris.target[ids]
#
# iris_feature = pd.DataFrame(data= np.c_[train_x],
#                      columns= ["sepal_length","sepal_width","petal_length","petal_width"])
#
# iris_label = pd.DataFrame(data= train_y,
#                      columns= ['target'])
#
# from sklearn.model_selection import train_test_split
#
# X_train, X_test, y_train, y_test = train_test_split(
#     iris_feature, iris_label,
#     test_size=0.20,
#     random_state=42)
# # #
#
# print(y_test)
#
#

import numpy as np
import pandas as pd
from time import time
from sklearn.metrics import f1_score

# Read student data
student_data = pd.read_csv("student_data_number.csv")
# print(student_data)

feature = pd.DataFrame(data= student_data,
                     columns= ["address_R","address_U","famsize_GT3","famsize_LE3"])

label = pd.DataFrame(data= student_data,
                     columns= ["passed"])
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(
    feature, label,
    test_size=0.20,
    random_state=42)
print(y_test)
# # # # # 测试 Random forest
input = {
    'model_name': 'Randomforest',
    'x_tr': X_train,
    'x_te': X_test,
    'y_tr': y_train,
    'y_te': y_test,
}


params = {
    'estimator': {
        'args': {
            "weights_name":None,
            "keys_name":None,
            "num_classes":2,
            "num_features":4,
            "num_trees":3,
            "max_nodes":1000,
            "early_stopping_rounds":100,
            "regression":False,
            "split_after_samples":20
        }
    },
    'fit': {
        "args": {
            "steps": 300
        }
    },
    'evaluate': {
        'args': {
            'steps': 1
        }
    }
}

sds = staging_data_set_business.get_by_id('595cb76ed123ab59779604c3')
from server3.lib.models.randomforest import random_forest_model_fn
result = custom_model(params, random_forest_model_fn, input, result_sds=sds)
print(result)
# #


# # 测试 logistic_regressor
#
# input = {
#     'model_name': 'logistic_regressor',
#     'df_features': iris_feature,
#     'df_labels': iris_label,
# }
# params = {
#     'estimator': {
#         'args': {
#
#         }
#     },
#     'fit': {
#         "args": {
#             "steps": 300
#         }
#     },
#     'evaluate': {
#         'args': {
#             'steps': 1
#         }
#     }
# }
#
# sds = staging_data_set_business.get_by_id('595cb76ed123ab59779604c3')
# from server3.lib.models.logistic_regressor import logistic_regressor_model_fn
# result = custom_model(params, logistic_regressor_model_fn, input, result_sds=sds)
# print(result)




# 测试 Linear_classifier

# input = {
#     'model_name': 'Linear_classifier',
#     'x_tr': X_train,
#     'x_te': X_test,
#     'y_tr': y_train,
#     'y_te': y_test,
# }
#
# params = {
#     'estimator': {
#         'args': {
#             "dimension": 4,
#             "num_classes": 2,
#             "weight_column_name": None,
#             "gradient_clip_norm": None,
#             "enable_centered_bias": False,
#             "_joint_weight": False,
#             "label_keys": None,
#         }
#     },
#     'fit': {
#         "args": {
#             "steps": 300
#         }
#     },
#     'evaluate': {
#         'args': {
#             'steps': 1
#         }
#     }
# }
#
# sds = staging_data_set_business.get_by_id('595cb76ed123ab59779604c3')
# from server3.lib.models.linear_classifier import linear_classifier_model_fn
# result = custom_model(params, linear_classifier_model_fn, input, result_sds=sds)
# print(result)

# # 测试 svm
#
# input = {
#     'model_name': 'svm',
#     'x_tr': X_train,
#     'x_te': X_test,
#     'y_tr': y_train,
#     'y_te': y_test,
# }
#
#
# params = {
#     'estimator': {
#         'args': {
#             "dimension": 4,
#             "weight_column_name": None,
#             "model_dir": None,
#             "l1_regularization": 0.0,
#             "l2_regularization": 0.0,
#             "num_loss_partitions": 1,
#             "kernels": None,
#             "config": None,
#         }
#     },
#     'fit': {
#         "args": {
#             "steps": 300
#         }
#     },
#     'evaluate': {
#         'args': {
#             'steps': 1
#         }
#     }
# }
#
# sds = staging_data_set_business.get_by_id('595cb76ed123ab59779604c3')
# from server3.lib.models.svm import svm_model_fn
# result = custom_model(params, svm_model_fn, input, result_sds=sds)
# print(result)


#################
# # 测试 回归：
# 生成测试数据

# import numpy as np
# import pandas as pd
# from sklearn.datasets import load_boston
#
# boston = load_boston()
# boston_feature = pd.DataFrame(data= np.c_[boston['data']],
#                      columns= boston['feature_names'] )
# boston_label = pd.DataFrame(data= boston['target'],
#                      columns= ['target'])
#
# from sklearn.model_selection import train_test_split
#
# X_train, X_test, y_train, y_test = train_test_split(
#     boston_feature, boston_label,
#     test_size=0.20,
#     random_state=42)

# 测试 linear_regressor
# from sklearn.model_selection import train_test_split
#
# X_train, X_test, y_train, y_test = train_test_split(
#     boston_feature, boston_label,
#     test_size=0.20,
#     random_state=42)
#
# input = {
#     'model_name': 'linear_regressor',
#     'x_tr': X_train,
#     'x_te': X_test,
#     'y_tr': y_train,
#     'y_te': y_test,
# }
# params = {
#     'estimator': {
#         'args': {
#             "dimension": 13,
#             "weight_column_name": None,
#             "gradient_clip_norm": None,
#             "enable_centered_bias": False,
#             "_joint_weight": False,
#             "label_dimension": 1,
#         }
#     },
#     'fit': {
#         "args": {
#             "steps": 1000
#         }
#     },
#     'evaluate': {
#         'args': {
#             'steps': 1
#         }
#     }
# }
# sds = staging_data_set_business.get_by_id('595cb76ed123ab59779604c3')
# from server3.lib.models.linear_regressor import linear_regressor_model_fn
# result = custom_model(params, linear_regressor_model_fn, input, result_sds=sds)
# print(result)


# # 测试 Random forest
#
# input = {
#     'model_name': 'Randomforest',
#     'x_tr': X_train,
#     'x_te': X_test,
#     'y_tr': y_train,
#     'y_te': y_test,
# }
#
# params = {
#     'estimator': {
#         'args': {
#             "weights_name":None,
#             "keys_name":None,
#             "num_classes":1,
#             "num_features":13,
#             "num_trees":3,
#             "max_nodes":1000,
#             "regression":True,
#             "early_stopping_rounds":100,
#             "split_after_samples":20
#         }
#     },
#     'fit': {
#         "args": {
#             "steps": 300
#         }
#     },
#     'evaluate': {
#         'args': {
#             'steps': 1
#         }
#     }
# }
#
# sds = staging_data_set_business.get_by_id('595cb76ed123ab59779604c3')
# from server3.lib.models.randomforest import random_forest_model_fn
# result = custom_model(params, random_forest_model_fn, input, result_sds=sds)
# print(result)
