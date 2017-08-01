from __future__ import absolute_import
from __future__ import division
from __future__ import print_function
"""
use hyperas to tune hyperparameters of basic models

Author: Bingwei Chen
Date: 2017.07.28

1. test linear regression model
2. define JSON template got from frontend
3. define JSON give to frontend to generate UI
4. using JSON from frontend to generate hyperopt code
5. run hyperopt code
"""
from hyperopt import fmin, tpe, hp, partial

import math

import six
import tensorflow as tf
from tensorflow.contrib import layers
from tensorflow.contrib.framework.python.ops import \
    variables as contrib_variables
from tensorflow.contrib.layers.python.layers import feature_column
from tensorflow.contrib.learn.python.learn.estimators import head as head_lib
from tensorflow.python.feature_column import feature_column as fc_core
from tensorflow.python.framework import ops
from tensorflow.python.ops import clip_ops
from tensorflow.python.ops import gradients
from tensorflow.python.ops import partitioned_variables
from tensorflow.python.ops import variable_scope
from tensorflow.python.training import training as train


def train_hyperopt_model(conf, input):
    pass
    # generate space
    space = conf_to_space(conf)
    best = fmin(linear_regression_model_fn, space, algo=tpe.suggest, max_evals=2)
    print('best\n', best)


def conf_to_space(conf):
    space = {}
    estimator = conf["estimator"]
    args = estimator["args"]
    for key, value in args.items():
        print(key, value)
        if (type(value) is dict) and "distribute" in value:
            space[key] = getattr(hp, value["distribute"])(key, value["value"])
        else:
            space[key] = value
    return space


# The default learning rate of 0.2 is a historical artifact of the initial
# implementation, but seems a reasonable choice.
_LEARNING_RATE = 0.2


def _get_optimizer(spec):
    if isinstance(spec, six.string_types):
        return layers.OPTIMIZER_CLS_NAMES[spec](
            learning_rate=_LEARNING_RATE)
    elif callable(spec):
        return spec()
    return spec


# Ensures consistency with LinearComposableModel.
def _get_default_optimizer(feature_columns):
    learning_rate = min(_LEARNING_RATE, 1.0 / math.sqrt(len(feature_columns)))
    return train.FtrlOptimizer(learning_rate=learning_rate)


def linear_regression_model_fn(kwargs):
    """A model_fn for linear models that use a gradient-based optimizer.
    Args:
      features: `Tensor` or dict of `Tensor` (depends on data passed to `fit`).
      labels: `Tensor` of shape [batch_size, 1] or [batch_size] labels of
        dtype `int32` or `int64` in the range `[0, n_classes)`.
      mode: Defines whether this is training, evaluation or prediction.
        See `ModeKeys`.
      params: A dict of hyperparameters.
        The following hyperparameters are expected:
        * head: A `Head` instance.
        * feature_columns: An iterable containing all the feature columns used by
            the model.
        * optimizer: string, `Optimizer` object, or callable that defines the
            optimizer to use for training. If `None`, will use a FTRL optimizer.
        * gradient_clip_norm: A float > 0. If provided, gradients are
            clipped to their global norm with this clipping ratio.
        * joint_weights: If True, the weights for all columns will be stored in a
          single (possibly partitioned) variable. It's more efficient, but it's
          incompatible with SDCAOptimizer, and requires all feature columns are
          sparse and use the 'sum' combiner.
      config: `RunConfig` object to configure the runtime settings.
    Returns:
      A `ModelFnOps` instance.
    Raises:
      ValueError: If mode is not any of the `ModeKeys`.
    """
    features = kwargs["features"]
    labels = kwargs["labels"]
    mode = kwargs["mode"]
    params = {
        "weight_column_name": kwargs["weight_column_name"],
        "label_dimension": kwargs["label_dimension"],
        "enable_centered_bias": kwargs["enable_centered_bias"],
        "feature_columns": kwargs["feature_columns"],
        "gradient_clip_norm": kwargs["gradient_clip_norm"],
        "joint_weights": kwargs["joint_weights"],
    }
    # option
    config = kwargs.get("config")

    #   head = head_lib.multi_class_head(
    #         params["n_classes"],
    #         weight_column_name=params["weight_column_name"],
    #         enable_centered_bias=params["enable_centered_bias"],
    #         label_keys=params["label_keys"])

    head = head_lib.regression_head(
        weight_column_name=params["weight_column_name"],
        label_dimension=params["label_dimension"],
        enable_centered_bias=params["enable_centered_bias"])

    feature_columns_realvalued = [tf.contrib.layers.real_valued_column(i) for i
                                  in params["feature_columns"][0]]
    feature_columns_sparse = [
        tf.contrib.layers.sparse_column_with_hash_bucket(i,
                                                         hash_bucket_size=100) \
        for i in params["feature_columns"][1]]
    feature_columns = feature_columns_realvalued + feature_columns_sparse
    optimizer = _get_default_optimizer(feature_columns)
    gradient_clip_norm = params.get("gradient_clip_norm", None)
    num_ps_replicas = config.num_ps_replicas if config else 0
    joint_weights = params.get("joint_weights", False)

    if not isinstance(features, dict):
        features = {"": features}

    parent_scope = "linear"

    partitioner = partitioned_variables.min_max_variable_partitioner(
        max_partitions=num_ps_replicas,
        min_slice_size=64 << 20)

    with variable_scope.variable_scope(
            parent_scope,
            values=tuple(six.itervalues(features)),
            partitioner=partitioner) as scope:
        if all([isinstance(fc, feature_column._FeatureColumn)
                # pylint: disable=protected-access
                for fc in feature_columns]):
            if joint_weights:
                layer_fn = layers.joint_weighted_sum_from_feature_columns
            else:
                layer_fn = layers.weighted_sum_from_feature_columns
            logits, _, _ = layer_fn(
                columns_to_tensors=features,
                feature_columns=feature_columns,
                num_outputs=head.logits_dimension,
                weight_collections=[parent_scope],
                scope=scope)
        else:
            logits = fc_core.linear_model(
                features=features,
                feature_columns=feature_columns,
                units=head.logits_dimension,
                weight_collections=[parent_scope])

        def _train_op_fn(loss):
            global_step = contrib_variables.get_global_step()
            my_vars = ops.get_collection(parent_scope)
            grads = gradients.gradients(loss, my_vars)
            if gradient_clip_norm:
                grads, _ = clip_ops.clip_by_global_norm(grads,
                                                        gradient_clip_norm)
            return (_get_optimizer(optimizer).apply_gradients(
                zip(grads, my_vars), global_step=global_step))

        return head.create_model_fn_ops(
            features=features,
            mode=mode,
            labels=labels,
            train_op_fn=_train_op_fn,
            logits=logits)


DISTRIBUTE = {
    "name": "distribute_choice",
    "type": {
        'key': 'choice',
        'des': 'distribute choice for hyperparameters tuning',
        'range': [
            {
                'name': "uniform",
                'type': {
                    'key': 'join_low_high',
                    'des': 'Uniform distribution, Returns a value uniformly between low and high.',
                },
                'default': "0, 1",
                'eg': "0, 1"
            },
            {
                'name': "choice",
                'type': {
                    'key': 'multiple',
                    'des': "Choice distribution, "
                           "Returns one of the options, which should be a list or tuple.",
                },
                'default': None,
                "eg": [256, 512, 1024]
            }
        ]
    },
}

LinearRegression = {
    'estimator': {
        'args': [
            {
                "name": "weight_column_name",
                "type": {
                    "key": "string",
                    "des": "A string defining feature column name representing "
                           "weights. It is used to down weight or boost "
                           "examples during training. It will be multiplied by "
                           "the loss of the example."
                },
                "default": None,
                "required": False,
                "distribute": DISTRIBUTE
            },
            {
                "name": "gradient_clip_norm",
                "type": {
                    "key": "float",
                    "des": "A float > 0. If provided, gradients are\
                    clipped to their\
global norm\
with this clipping ratio.",
                    "range": [0.0, 100]
                },
                "default": None,
                "required": True,
                "distribute": DISTRIBUTE
            }
        ]
    },
    'fit': {
        "data_fields": {
            "name": "x_y_fields",
            "type": {
                "key": "select_box",
                "des": "data fields for x",
            },
            "default": None,
            "required": True,
            "data_type": None,
            "len_range": None
        },
        'args': [
            {
                "name": "step",
                "type": {
                    "key": "int",
                    "des": "steps for training",
                    "range": None
                },
                "default": 30,
                "required": True,
                "distribute": DISTRIBUTE
            },
        ]
    },
    'evaluate': {
        'args': [
            {
                "name": "step",
                "type": {
                    "key": "int",
                    "des": "steps for evaluate",
                    "range": None
                },
                "default": 1,
                "required": True,
                "distribute": DISTRIBUTE
            },
        ]
    }
}

LinearRegressionTemplate = {
    "conf": {
        "estimator": {
            "args": {
                "dimension": 3,
                "weight_column_name": {
                    "distribute": "choice",
                    "value": [256, 512]
                },
                "gradient_clip_norm": None,
                "enable_centered_bias": False,
                "_joint_weight": False,
                "label_dimension": 1
            }
        },
        "fit": {
            "data_fields": [["PT", "NOX", "DIS"], ["MV"]],
            "args": {
                "steps": 30
            }
        },
        "evaluate": {
            "args": {
                "steps": 1
            }
        }
    },
    "project_id": "595f32e4e89bde8ba70738a3",
    "staging_data_set_id": "5979da380c11f32674eb2788"
}

if __name__ == "__main__":
    space = conf_to_space(LinearRegressionTemplate["conf"])

