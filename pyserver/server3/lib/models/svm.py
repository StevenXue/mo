from tensorflow.contrib import layers
from tensorflow.contrib.learn.python.learn.estimators import head as head_lib
from tensorflow.contrib.learn.python.learn.estimators import linear
from tensorflow.contrib.linear_optimizer.python import sdca_optimizer
from tensorflow.python.ops import variable_scope
from tensorflow.python.framework import sparse_tensor
from tensorflow.python.framework import tensor_util
from tensorflow.python.ops import array_ops
from tensorflow.python.framework import dtypes
from tensorflow.contrib.framework.python.ops import \
    variables as contrib_variables
from tensorflow.python.ops import array_ops
from tensorflow.python.framework import constant_op
from tensorflow.python.framework import sparse_tensor
from server3.constants import SPEC


def _add_bias_column(feature_columns, columns_to_tensors, bias_variable,
                     columns_to_variables):
    """Adds a fake bias feature column filled with all 1s."""
    bias_column_name = "tf_virtual_bias_column"
    if any(col.name is bias_column_name for col in feature_columns):
        raise ValueError("%s is a reserved column name." % bias_column_name)
    if not feature_columns:
        raise ValueError("feature_columns can't be empty.")

    # Loop through input tensors until we can figure out batch_size.
    batch_size = None
    for column in columns_to_tensors.values():
        if isinstance(column, tuple):
            column = column[0]
        if isinstance(column, sparse_tensor.SparseTensor):
            shape = tensor_util.constant_value(column.dense_shape)
            if shape is not None:
                batch_size = shape[0]
                break
        else:
            batch_size = array_ops.shape(column)[0]
            break
    if batch_size is None:
        raise ValueError("Could not infer batch size from input features.")

    bias_column = layers.real_valued_column(bias_column_name)
    columns_to_tensors[bias_column] = array_ops.ones([batch_size, 1],
                                                     dtype=dtypes.float32)
    columns_to_variables[bias_column] = [bias_variable]


def parse_tensor_or_dict(features):
    if isinstance(features, dict):
        return array_ops.concat([features[k] for k in sorted(features.keys())],
                                1)
    return features


def example_id_column(features):
    # if feature is a dict
    if isinstance(features, dict):
        lenth = list(features.values())[0].get_shape().as_list()
        results = list(map(str, list(range(lenth[0]))))
        features['index'] = constant_op.constant(results)
        # print(features['index'])


def svm_model_fn(features, labels, mode, params):
    """A model_fn for linear models that use the SDCA optimizer.
    Args:
      features: A dict of `Tensor` keyed by column name.
      labels: `Tensor` of shape [batch_size, 1] or [batch_size] labels of
        dtype `int32` or `int64` in the range `[0, n_classes)`.
      mode: Defines whether this is training, evaluation or prediction.
        See `ModeKeys`.
      params: A dict of hyperparameters.
        The following hyperparameters are expected:
        * head: A `Head` instance. Type must be one of `_BinarySvmHead`,
            `_RegressionHead` or `_BinaryLogisticHead`.
        * feature_columns: An iterable containing all the feature columns
        used by
            the model.
        * optimizer: An `SDCAOptimizer` instance.
        * weight_column_name: A string defining the weight feature column, or
            None if there are no weights.
        * update_weights_hook: A `SessionRunHook` object or None. Used to
        update
            model weights.
    Returns:
      A `ModelFnOps` instance.
    Raises:
      ValueError: If `optimizer` is not an `SDCAOptimizer` instance.
      ValueError: If the type of head is neither `_BinarySvmHead`, nor
        `_RegressionHead` nor `_MultiClassHead`.
      ValueError: If mode is not any of the `ModeKeys`.
    """

    feature_columns = [layers.real_valued_column(i) for i in features.keys()]
    example_id_column(features)

    weight_column_name = params.get("weight_column_name")

    head = head_lib.binary_svm_head(
        weight_column_name=weight_column_name,
        enable_centered_bias=False)

    optimizer = sdca_optimizer.SDCAOptimizer(
        example_id_column="index",
        num_loss_partitions=params["num_loss_partitions"],
        symmetric_l1_regularization=params["l1_regularization"],
        symmetric_l2_regularization=params["l2_regularization"])

    chief_hook = linear._SdcaUpdateWeightsHook()
    update_weights_hook = chief_hook

    if not isinstance(optimizer, sdca_optimizer.SDCAOptimizer):
        raise ValueError("Optimizer must be of type SDCAOptimizer")

    if isinstance(head,
                  head_lib._BinarySvmHead):  # pylint: disable=protected-access
        loss_type = "hinge_loss"
    elif isinstance(head,
                    head_lib._BinaryLogisticHead):  # pylint:
        # disable=protected-access
        loss_type = "logistic_loss"
    elif isinstance(head,
                    head_lib._RegressionHead):  # pylint:
        # disable=protected-access
        assert head.logits_dimension == 1, ("SDCA only applies for "
                                            "logits_dimension=1.")
        loss_type = "squared_loss"
    else:
        raise ValueError("Unsupported head type: {}".format(head))

    parent_scope = "linear"

    with variable_scope.variable_op_scope(
            features.values(), parent_scope) as scope:
        features = features.copy()
        features.update(layers.transform_features(features, feature_columns))
        logits, columns_to_variables, bias = (
            layers.weighted_sum_from_feature_columns(
                columns_to_tensors=features,
                feature_columns=feature_columns,
                num_outputs=1,
                scope=scope))

        linear._add_bias_column(feature_columns, features, bias,
                                columns_to_variables)

    def _train_op_fn(unused_loss):
        global_step = contrib_variables.get_global_step()
        sdca_model, train_op = optimizer.get_train_step(columns_to_variables,
                                                        weight_column_name,
                                                        loss_type, features,
                                                        labels, global_step)
        if update_weights_hook is not None:
            update_weights_hook.set_parameters(sdca_model, train_op)
        return train_op

    model_fn_ops = head.create_model_fn_ops(
        features=features,
        labels=labels,
        mode=mode,
        train_op_fn=_train_op_fn,
        logits=logits)
    if update_weights_hook is not None:
        return model_fn_ops._replace(
            training_chief_hooks=(model_fn_ops.training_chief_hooks +
                                  [update_weights_hook]))
    return model_fn_ops


SVMSteps = [
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
        "name": "label_fields",
        "display_name": "Select Label Fields",
        "args": [
            {
                "name": "fields",
                "des": "",
                "type": "multiple_choice",
                "required": True,
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
                "name": "example_id_column",
                "display_name": "Example Id Column",
                "value_type": "str",
                "des": "A string defining the feature column name "
                       "representing example ids. Used to initialize the underlying optimizer.",
                "default": "index",
            },
            {
                **SPEC.ui_spec['input'],
                "name": "weight_column_name",
                "display_name": "Weight Column Name",
                "value_type": "str",
                "des": "A string defining feature column name "
                       "representing "
                       "weights. It is used to down weight or boost "
                       "examples during training. It will be multiplied "
                       "by "
                       "the loss of the example."
            },
            {
                **SPEC.ui_spec['input'],
                "name": "l1_regularization",
                "display_name": "L1 Regularization",
                "value_type": "float",
                "des": "L1-regularization parameter. Refers to global L1 regularization (across all examples).",
                "default": 0.0,
            },
            {
                **SPEC.ui_spec['input'],
                "name": "L2 Regularization",
                "value_type": "float",
                "des": "L2-regularization parameter. Refers to global L1 regularization (across all examples).",
                "default": 0.0,
            },
            {
                **SPEC.ui_spec['input'],
                "name": "num_loss_partitions",
                "display_name": "Num Loss Partitions",
                "des": "number of partitions of the (global) loss function optimized by the underlying optimizer (SDCAOptimizer). num_loss_partitions defines the number of partitions of the global loss function",
                "default": 1,
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

SVM = {
    'estimator': {
        'args': [
            {
                "name": "example_id_column",
                "type": {
                    "key": "string",
                    "des": "A string defining the feature column name representing "
                           "example ids. Used to initialize the underlying "
                           "optimizer."
                },
                "default": "index",
                "required": True
            },
            {
                "name": "weight_column_name",
                "type": {
                    "key": "string",
                    "des": "A string defining feature column name representing "
                           "weights. It is used to down weight or boost examples "
                           "during training. It will be multiplied by the loss of the "
                           "example."
                },
                "default": None,
                "required": False
            },
            {
                "name": "l1_regularization",
                "type": {
                    "key": "float",
                    "des": "L1-regularization parameter. Refers to global L1 "
                           "regularization (across all examples).",
                    "range": None
                },
                "default": 0.0,
                "required": True
            },
            {
                "name": "l2_regularization",
                "type": {
                    "key": "float",
                    "des": "L2-regularization parameter. Refers to global L1 "
                           "regularization (across all examples).",
                    "range": None
                },
                "default": 0.0,
                "required": True
            },
            {
                "name": "num_loss_partitions",
                "type": {
                    "key": "int",
                    "des": "number of partitions of the (global) loss function "
                           "optimized by the underlying optimizer (SDCAOptimizer)."
                           "num_loss_partitions defines the number of partitions of "
                           "the global loss function",
                    "range": None
                },
                "default": 1,
                "required": True
            }
        ]
    },
    'fit': {
        "data_fields": {
            "name": "x_y_fields",
            "type": {
                "key": "transfer_box",
                "des": "data fields for x and y",
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
        ],
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
