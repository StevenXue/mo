# tensorflow 1.3.0
# 源码地址：
# https://github.com/tensorflow/tensorflow/blob/r1.3/tensorflow/contrib
# /learn/python/learn/estimators/logistic_regressor.py

# Warning: 不可使用 _get_input_fn 自动批次导入fit , 需自定义 input_fn
#  测试发现 _get_input_fn 生成的label格式与 计算loss所需的格式不符，报错

from tensorflow.contrib import layers
from tensorflow.contrib.framework.python.ops import variables
from tensorflow.contrib.layers.python.layers import optimizers
from tensorflow.contrib.losses.python.losses import loss_ops
from tensorflow.python.ops import array_ops
from tensorflow.python.ops import init_ops
from tensorflow.contrib import metrics as metrics_lib
from tensorflow.contrib.learn.python.learn.estimators import constants
from tensorflow.contrib.learn.python.learn.estimators import metric_key
from tensorflow.contrib.learn.python.learn.estimators import model_fn as model_fn_lib
from tensorflow.python.ops import math_ops


def _make_logistic_eval_metric_ops(labels, predictions, thresholds):
    """Returns a dictionary of evaluation metric ops for logistic regression.
    Args:
      labels: The labels `Tensor`, or a dict with only one `Tensor` keyed by
      name.
      predictions: The predictions `Tensor`.
      thresholds: List of floating point thresholds to use for accuracy,
        precision, and recall metrics.
    Returns:
      A dict of metric results keyed by name.
    """
    # If labels is a dict with a single key, unpack into a single tensor.
    labels_tensor = labels
    if isinstance(labels, dict) and len(labels) == 1:
        labels_tensor = labels.values()[0]

    metrics = {}
    metrics[metric_key.MetricKey.PREDICTION_MEAN] = metrics_lib.streaming_mean(
        predictions)
    metrics[metric_key.MetricKey.LABEL_MEAN] = metrics_lib.streaming_mean(
        labels_tensor)
    # Also include the streaming mean of the label as an accuracy baseline, as
    # a reminder to users.
    metrics[
        metric_key.MetricKey.ACCURACY_BASELINE] = metrics_lib.streaming_mean(
        labels_tensor)

    metrics[metric_key.MetricKey.AUC] = metrics_lib.streaming_auc(
        labels=labels_tensor, predictions=predictions)

    for threshold in thresholds:
        predictions_at_threshold = math_ops.to_float(
            math_ops.greater_equal(predictions, threshold),
            name='predictions_at_threshold_%f' % threshold)
        metrics[metric_key.MetricKey.ACCURACY_MEAN % threshold] = (
            metrics_lib.streaming_accuracy(labels=labels_tensor,
                                           predictions=predictions_at_threshold))
        # Precision for positive examples.
        metrics[metric_key.MetricKey.PRECISION_MEAN % threshold] = (
            metrics_lib.streaming_precision(labels=labels_tensor,
                                            predictions=predictions_at_threshold))
        # Recall for positive examples.
        metrics[metric_key.MetricKey.RECALL_MEAN % threshold] = (
            metrics_lib.streaming_recall(labels=labels_tensor,
                                         predictions=predictions_at_threshold))

    return metrics

def parse_tensor_or_dict(features):
    if isinstance(features, dict):
        return array_ops.concat([features[k] for k in sorted(features.keys())],
                                1)
    return features


def logistic_regressor_model_fn(features, labels, mode, params):
    """Model function that appends logistic evaluation metrics."""
    thresholds = params.get('thresholds') or [.5]
    logits = layers.linear(
        parse_tensor_or_dict(features),
        1,
        weights_initializer=init_ops.zeros_initializer(),
        # Intentionally uses really awful initial values so that
        # AUC/precision/recall/etc will change meaningfully even on a toy
        # dataset.
        biases_initializer=init_ops.constant_initializer(-10.0))
    predictions = math_ops.sigmoid(logits)
    loss = loss_ops.sigmoid_cross_entropy(logits, labels)
    train_op = optimizers.optimize_loss(
        loss, variables.get_global_step(), optimizer='Adagrad',
        learning_rate=0.1)

    if mode == model_fn_lib.ModeKeys.EVAL:
        eval_metric_ops = _make_logistic_eval_metric_ops(
            labels=labels,
            predictions=predictions,
            thresholds=thresholds)
    else:
        eval_metric_ops = None
    return model_fn_lib.ModelFnOps(
        mode=mode,
        predictions=predictions,
        loss=loss,
        train_op=train_op,
        eval_metric_ops=eval_metric_ops,
        output_alternatives={
            'head': (constants.ProblemType.LOGISTIC_REGRESSION, {
                'predictions': predictions
            })
        })


params = {
    'thresholds': [0.5, 0.6],
}

LogisticRegressor = {
    'estimator': {
        'args': [
            {
                "name": "thresholds",
                "type": {
                    "key": "int_m",
                    "des": "List of floating point thresholds to "
                           "use for accuracy, precision, and recall "
                           "metrics.If `None`, defaults to `[0.5]`."
                },
                "default": [0.5],
                "required": True
            },
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
