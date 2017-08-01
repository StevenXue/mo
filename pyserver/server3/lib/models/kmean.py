# Copyright 2016 The TensorFlow Authors. All Rights Reserved.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
# ==============================================================================
"""Implementation of k-means clustering on top of tf.learn API."""

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

import time
import numpy as np

from tensorflow.contrib.factorization.python.ops import clustering_ops
from tensorflow.contrib.framework.python.ops import variables
from tensorflow.contrib.learn.python.learn.estimators import estimator
from tensorflow.contrib.learn.python.learn.estimators.model_fn import ModelFnOps
from tensorflow.python.framework import ops
from tensorflow.python.framework import constant_op
from tensorflow.python.ops import array_ops
from tensorflow.python.ops import math_ops
from tensorflow.python.ops import state_ops
from tensorflow.python.summary import summary
from tensorflow.python.ops.control_flow_ops import with_dependencies
from tensorflow.python.platform import tf_logging as logging
from tensorflow.python.summary import summary
from tensorflow.python.training import session_run_hook
from tensorflow.python.training.session_run_hook import SessionRunArgs


class _LossRelativeChangeHook(session_run_hook.SessionRunHook):
    """Stops when the change in loss goes below a tolerance."""

    def __init__(self, tolerance):
        """Initializes _LossRelativeChangeHook.
        Args:
          tolerance: A relative tolerance of change between iterations.
        """
        self._tolerance = tolerance
        self._prev_loss = None

    def begin(self):
        self._loss_tensor = ops.get_default_graph().get_tensor_by_name(
            'kmeans_loss' + ':0')
        assert self._loss_tensor is not None

    def before_run(self, run_context):
        del run_context
        return SessionRunArgs(
            fetches={'kmeans_loss': self._loss_tensor})

    def after_run(self, run_context, run_values):
        loss = run_values.results['kmeans_loss']
        assert loss is not None
        if self._prev_loss is not None:
            relative_change = (abs(loss - self._prev_loss) /
                               (1 + abs(self._prev_loss)))
            if relative_change < self._tolerance:
                run_context.request_stop()
        self._prev_loss = loss


class _InitializeClustersHook(session_run_hook.SessionRunHook):
    """Initializes clusters or waits for cluster initialization."""

    def __init__(self, init_op, is_initialized_op, is_chief):
        self._init_op = init_op
        self._is_chief = is_chief
        self._is_initialized_op = is_initialized_op

    def after_create_session(self, session, _):
        assert self._init_op.graph == ops.get_default_graph()
        assert self._is_initialized_op.graph == self._init_op.graph
        while True:
            try:
                if session.run(self._is_initialized_op):
                    break
                elif self._is_chief:
                    session.run(self._init_op)
                else:
                    time.sleep(1)
            except RuntimeError as e:
                logging.info(e)


def _parse_tensor_or_dict(features):
    """Helper function to parse features."""
    # 检验 features 的格式 是否为 dict
    if isinstance(features, dict):
        # 提取 features dict 的 key
        keys = sorted(features.keys())
        # ops.colocate_with 的作用
        # For example:
        #     ```python
        #     a = tf.Variable([1.0])
        #     with g.colocate_with(a):
        #       b = tf.constant(1.0)
        #       c = tf.add(a, b)
        #     ```
        #     `b` and `c` will always be colocated with `a`, no matter where `a`
        #     is eventually placed.
        # 详见
        # https://github.com/tensorflow/tensorflow/blob/master/tensorflow/python/framework/ops.py
        with ops.colocate_with(features[keys[0]]):
            #         array_ops.concat的作用
            # For example:
            #   ```python
            #   t1 = [[1, 2, 3], [4, 5, 6]]
            #   t2 = [[7, 8, 9], [10, 11, 12]]
            #   tf.concat([t1, t2], 0) ==> [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10, 11, 12]]
            #   tf.concat([t1, t2], 1) ==> [[1, 2, 3, 7, 8, 9], [4, 5, 6, 10, 11, 12]]
            #   # tensor t3 with shape [2, 3]
            #   # tensor t4 with shape [2, 3]
            #   tf.shape(tf.concat([t3, t4], 0)) ==> [4, 3]
            #   tf.shape(tf.concat([t3, t4], 1)) ==> [2, 6]
            #   ```
            #        详见
            #       https://github.com/tensorflow/tensorflow/blob/master/tensorflow/python/ops/array_ops.py
            features = array_ops.concat([features[k] for k in keys], 1)

    return features


def kmeans_clustering_model_fn(features, labels, mode, params, config):
    """Model function for KMeansClustering estimator."""
    # https://wiki.python.org/moin/UsingAssertionsEffectively
    assert labels is None, "labels are not needed: " + labels

    #   clustering_ops.KMeans 是重要的算法实现过程
    #   https://github.com/tensorflow/tensorflow/blob/master/tensorflow/contrib/factorization/python/ops/clustering_ops.py
    (all_scores, model_predictions, losses,
     is_initialized, init_op, training_op) = clustering_ops.KMeans(
        _parse_tensor_or_dict(features),
        params.get('num_clusters'),
        initial_clusters=clustering_ops.RANDOM_INIT,
        distance_metric=clustering_ops.SQUARED_EUCLIDEAN_DISTANCE,
        use_mini_batch=params.get('use_mini_batch'),
        mini_batch_steps_per_iteration=params.get(
            'mini_batch_steps_per_iteration'),
        random_seed=params.get('random_seed'),
        kmeans_plus_plus_num_retries=params.get(
            'kmeans_plus_plus_num_retries')).training_graph()

    incr_step = state_ops.assign_add(variables.get_global_step(), 1)
    loss = math_ops.reduce_sum(losses, name='kmeans_loss')
    #  Outputs a Summary protocol buffer containing a single scalar value.
    #  Used for visualizing in TensorBoard
    summary.scalar('loss/raw', loss)
    #  https://github.com/tensorflow/tensorflow/blob/master/tensorflow/python/ops/control_flow_ops.py
    #  with_dependencies(dependencies, output_tensor, name=None):
    #  Produces the content of `output_tensor` only after `dependencies`.
    training_op = with_dependencies([training_op, incr_step], loss)
    predictions = {
        'all_scores': all_scores[0],
        'cluster_idx': model_predictions[0],
    }
    eval_metric_ops = {'scores': loss}

    #  Hook for monitor
    training_hooks = [_InitializeClustersHook(
        init_op, is_initialized, config.is_chief)]
    relative_tolerance = params.get('relative_tolerance')
    if relative_tolerance is not None:
        training_hooks.append(_LossRelativeChangeHook(relative_tolerance))

    return ModelFnOps(
        mode=mode,
        predictions=predictions,
        eval_metric_ops=eval_metric_ops,
        loss=loss,
        train_op=training_op,
        training_hooks=training_hooks)


Kmeans = {
    'estimator': {
        'args': [
            {
                "name": "num_clusters",
                "type": {
                    "key": "int",
                    "des": "number of clusters to train."
                },
                "default": 2,
                "required": True
            },
            {
                "name": "random_seed",
                "type": {
                    "key": "int",
                    "des": "Seed for PRNG used to initialize centers."
                },
                "default": None,
                "required": True
            },
            {
                "name": "use_mini_batch",
                "type": {
                    "key": "bool",
                    "des": "If true, use the mini-batch k-means algorithm. Else assume full batch."
                },
                "default": None,
                "required": False
            },
            {
                "name": "kmeans_plus_plus_num_retries",
                "type": {
                    "key": "int",
                    "des": "For each point that is sampled during kmeans++ initialization, this parameter specifies the number of additional points to draw from the current distribution before selecting the best. If a negative value is specified, a heuristic is used to sample O(log(num_to_sample)) additional points.",
                    "range": None
                },
                "default": 1,
                "required": True
            },
            {
                "name": "relative_tolerance",
                "type": {
                    "key": "float",
                    "des": "A relative tolerance of change in the loss between iterations. Stops learning if the loss changes less than this amount. Note that this may not work correctly if use_mini_batch=True.",
                    "range": [0.0, 100]
                },
                "default": None,
                "required": False
            }
        ]
    },
    'fit': {
        "data_fields": {
            "name": "training_fields",
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
