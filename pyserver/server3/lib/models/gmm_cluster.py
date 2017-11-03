# tensorflow 1.3.0
# 源码地址：
# https://github.com/tensorflow/tensorflow/blob/master/tensorflow/contrib
# /factorization/python/ops/gmm_ops.py
from tensorflow.contrib import framework
# from tensorflow.contrib.factorization.python.ops import gmm_ops
from tensorflow.contrib.framework.python.ops import variables
from tensorflow.contrib.learn.python.learn.estimators import \
    model_fn as model_fn_lib
from tensorflow.python.framework import constant_op
from tensorflow.python.ops import array_ops
from tensorflow.python.ops import math_ops
from tensorflow.python.ops import state_ops
from tensorflow.python.ops.control_flow_ops import with_dependencies
from server3.lib.models.modified_tf_file import gmm_ops
from server3.constants import SPEC


def parse_tensor_or_dict(features):
    if isinstance(features, dict):
        return array_ops.concat([features[k] for k in sorted(features.keys())],
                                1)
    return features


def streaming_sum(scalar_tensor):
    """Create a sum metric and update op."""
    sum_metric = framework.local_variable(constant_op.constant(0.0))
    sum_update = sum_metric.assign_add(scalar_tensor)
    return sum_metric, sum_update


def gmm_cluster_model_fn(features, labels, mode, params, config=None):
    """Model function."""
    assert labels is None, labels

    update_params = ''
    for i in ["w", "m", 'c']:
        if i in params["update_params"]:
            update_params += i
    (all_scores,
     model_predictions,
     losses, training_op) = gmm_ops.gmm(parse_tensor_or_dict(features),
                                        "random",
                                        params["num_clusters"],
                                        params["random_seed"],
                                        params["covariance_type"],
                                        update_params,
                                        )
    incr_step = state_ops.assign_add(variables.get_global_step(), 1)
    loss = math_ops.reduce_sum(losses)
    training_op = with_dependencies([training_op, incr_step], loss)
    predictions = {
        'all_scores': all_scores[0],
        'assignments': model_predictions[0][0],
    }
    eval_metric_ops = {
        'scores': streaming_sum(loss),
    }
    return model_fn_lib.ModelFnOps(mode=mode, predictions=predictions,
                                   eval_metric_ops=eval_metric_ops,
                                   loss=loss, train_op=training_op)


GMMSteps = [
    {
        "name": "data_source",
        "display_name": "Select Data Source",
        "args": [
            {
                "name": "input",
                "des": "Please select input data source",
                "type": "select_box",
                "default": None,
                "required": True,
                "len_range": [
                    1,
                    1
                ],
                "values": []
            }
        ]
    },
    {
        "name": "feature_fields",
        "display_name": "Select Feature Fields",
        "args": [
            {
                "name": "fields",
                "des": "",
                "required": True,
                "type": "multiple_choice",
                "len_range": [
                    1,
                    None
                ],
                "values": []
            }
        ]
    },
    {
        "name": "estimator",
        "display_name": "Estimator Parameters",
        'args': [
            {
                **SPEC.ui_spec['input'],
                "name": "num_clusters",
                "display_name": "Number of Clusters",
                "des": "number of clusters to train.",
                "default": 2,
                "required": True
            },
            {
                **SPEC.ui_spec['input'],
                "name": "random_seed",
                "display_name": "Random Seed",
                "des": "Seed for PRNG used to initialize centers.",
            },
            {
                **SPEC.ui_spec['choice'],
                "name": "covariance_type",
                "display_name": "Covariance Type",
                "des": "one of 'full', 'diag'",
                "range": ["full", "diag"],
                "default": "full",
                "required": True
            },
            {
                **SPEC.ui_spec['multiple_choice'],
                "name": "update_params",
                "display_name": "Update Params",
                "des": "Controls which parameters are "
                       "updated in the training process.Can "
                       "contain any combination of 'w' for "
                       "weights, 'm' for means, and 'c' for covars",
                "range": ["w", "m", 'c'],
                "default": ["w", "m", 'c'],
                "required": True
            }
        ]
    },
    {
        "name": "fit",
        "display_name": "Fit Parameters",
        "args": [
            {
                **SPEC.ui_spec['input'],
                "name": "steps",
                "display_name": "Steps",
                "des": "Number of steps of training",
                "default": 400,
                "required": True
            },
        ],
    },
    {
        "name": "evaluate",
        "display_name": "Evaluate Parameters",
        "args": [
            {
                **SPEC.ui_spec['input'],
                "name": "steps",
                "display_name": "Steps",
                "des": "Number of steps of evaluate",
                "default": 1,
                "required": True
            },
        ]
    }
]

GMMCluster = {
    'estimator': {
        'args': [
            {
                "name": "num_clusters",
                "type": {
                    "key": "int",
                    "des": "number of clusters to train",
                    "range": None
                },
                "default": 2,
                "required": True
            },
            {
                "name": "random_seed",
                "type": {
                    "key": "int",
                    "des": "Seed for PRNG used to initialize "
                           "centers.",
                    "range": None
                },
                "default": 0,
                "required": True
            },
            {
                "name": "covariance_type",
                "type": {
                    "key": "choice",
                    "des": "one of 'full', 'diag'",
                    "range": ["full", "diag"],
                },
                "default": "full",
                "required": True
            },
            {
                "name": "update_params",
                "type": {
                    "key": "string_m",
                    "des": "Controls which parameters are "
                           "updated in the training process.Can "
                           "contain any combination of 'w' for "
                           "weights, 'm' for means, and 'c' for covars",
                    "range": ["w", "m", 'c'],
                },
                "default": ["w", "m", 'c'],
                "required": True
            }
        ]
    },
    'fit': {
        "data_fields": {
            "name": "x_y_fields",
            "type": {
                "key": "transfer_box",
                "des": "data fields for x",
            },
            "default": None,
            "required": True,
            "x_data_type": None,
            "y_data_type": None,
            "x_len_range": None,
            "y_len_range": [1, 1]
        },
        'args': [
            {
                "name": "steps",
                "type": {
                    "key": "int",
                    "des": "steps for training",
                    "range": None
                },
                "default": 30,
                "required": True
            },
        ]
    },
    'evaluate': {
        'args': [
            {
                "name": "steps",
                "type": {
                    "key": "int",
                    "des": "steps for evaluate",
                    "range": None
                },
                "default": 1,
                "required": True
            },
        ]
    }
}
