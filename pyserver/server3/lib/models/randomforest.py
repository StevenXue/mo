# https://github.com/tensorflow/tensorflow/blob/r1.3/tensorflow/contrib
# /tensor_forest/client/random_forest.py
# https://github.com/tensorflow/tensorflow/blob/r1.3/tensorflow/contrib
# /tensor_forest/python/tensor_forest.py

from __future__ import absolute_import
from __future__ import division
from __future__ import print_function

from tensorflow.contrib import framework as contrib_framework
from tensorflow.contrib.learn.python.learn.estimators import constants
from tensorflow.contrib.learn.python.learn.estimators import \
    model_fn as model_fn_lib
from tensorflow.contrib.learn.python.learn.estimators import prediction_key

from tensorflow.contrib.tensor_forest.client import eval_metrics
from tensorflow.contrib.tensor_forest.python import tensor_forest

from tensorflow.python.framework import ops
from tensorflow.python.ops import control_flow_ops
from tensorflow.python.ops import math_ops
from tensorflow.python.ops import state_ops
from tensorflow.python.platform import tf_logging as logging
from tensorflow.python.training import basic_session_run_hooks
from tensorflow.python.training import monitored_session
from tensorflow.python.training import session_run_hook


class TensorForestLossHook(session_run_hook.SessionRunHook):
    """Monitor to request stop when loss stops decreasing."""

    def __init__(self, early_stopping_rounds):
        self.early_stopping_rounds = early_stopping_rounds
        self.min_loss = None
        self.last_step = -1
        # self.steps records the number of steps for which the loss has been
        # non-decreasing
        self.steps = 0

    def before_run(self, run_context):
        return session_run_hook.SessionRunArgs(
            {
                'global_step': contrib_framework.get_global_step(),
                'current_loss':
                    run_context.session.graph.get_operation_by_name(
                        'rf_training_loss').outputs[0]})

    def after_run(self, run_context, run_values):
        current_loss = run_values.results['current_loss']
        current_step = run_values.results['global_step']
        self.steps += 1
        # Guard against the global step going backwards, which might happen
        # if we recover from something.
        if self.last_step == -1 or self.last_step > current_step:
            logging.info('TensorForestLossHook resetting last_step.')
            self.last_step = current_step
            self.steps = 0
            self.min_loss = None
            return

        self.last_step = current_step
        if self.min_loss is None or current_loss < self.min_loss:
            self.min_loss = current_loss
            self.steps = 0
        if self.steps > self.early_stopping_rounds:
            logging.info('TensorForestLossHook requesting stop.')
            run_context.request_stop()


class EveryCheckpointPreSaveListener(
    basic_session_run_hooks.CheckpointSaverListener):
    """Runs a given op before each checkpoint save."""

    def __init__(self, op):
        """Initializes the object.
        Args:
          op: An op to run before each checkpoint save.
        """
        self._op = op

    def before_save(self, session, global_step_value):
        session.run(self._op)


def random_forest_model_fn(features, labels, mode, params, config):
    """Function that returns predictions, training loss, and training op."""

    weights_name = params["weights_name"]
    keys_name = params["keys_name"]
    params_toGraphs = tensor_forest.ForestHParams(
        num_classes=params['num_classes'], num_features=params['num_features'],
        num_trees=params['num_trees'], max_nodes=params['max_nodes'],
        regression=params['regression'],
        split_after_samples=params['split_after_samples'])
    #  注意第90行 fill()
    # https://github.com/tensorflow/tensorflow/blob/r1.2/tensorflow/contrib
    # /tensor_forest/python/tensor_forest.py
    params_toGraphs = params_toGraphs.fill()
    graph_builder_class = tensor_forest.RandomForestGraphs

    early_stopping_rounds = params["early_stopping_rounds"]
    num_trainers = 1
    trainer_id = 0
    report_feature_importances = False
    model_dir = None
    local_eval = False
    device_assigner = None
    weights = None
    if weights_name and weights_name in features:
        weights = features.pop(weights_name)

    keys = None
    if keys_name and keys_name in features:
        keys = features.pop(keys_name)

    # If we're doing eval, optionally ignore device_assigner.
    # Also ignore device assigner if we're exporting (mode == INFER)
    dev_assn = device_assigner
    if (mode == model_fn_lib.ModeKeys.INFER or
            (local_eval and mode == model_fn_lib.ModeKeys.EVAL)):
        dev_assn = None

    graph_builder = graph_builder_class(params_toGraphs,
                                        device_assigner=dev_assn)
    inference = {}
    output_alternatives = None
    if (mode == model_fn_lib.ModeKeys.EVAL or
                mode == model_fn_lib.ModeKeys.INFER):
        inference[eval_metrics.INFERENCE_PROB_NAME] = (
            graph_builder.inference_graph(features))

        if params_toGraphs.regression:
            predictions = {
                None: inference[eval_metrics.INFERENCE_PROB_NAME]}
            output_alternatives = {
                None: (constants.ProblemType.LINEAR_REGRESSION, predictions)}
        else:
            inference[eval_metrics.INFERENCE_PRED_NAME] = math_ops.argmax(
                inference[eval_metrics.INFERENCE_PROB_NAME], 1)

            predictions = {
                prediction_key.PredictionKey.PROBABILITIES:
                    inference[eval_metrics.INFERENCE_PROB_NAME],
                prediction_key.PredictionKey.CLASSES:
                    inference[eval_metrics.INFERENCE_PRED_NAME]}
            output_alternatives = {
                None: (constants.ProblemType.CLASSIFICATION, predictions)}

        if report_feature_importances:
            inference[eval_metrics.FEATURE_IMPORTANCE_NAME] = (
                graph_builder.feature_importances())

        if keys is not None:
            inference[keys_name] = keys

    # labels might be None if we're doing prediction (which brings up the
    # question of why we force everything to adhere to a single model_fn).
    loss_deps = []
    training_graph = None
    training_hooks = []
    scaffold = None
    if labels is not None and mode == model_fn_lib.ModeKeys.TRAIN:
        training_graph = control_flow_ops.group(
            graph_builder.training_graph(
                features, labels, input_weights=weights,
                num_trainers=num_trainers,
                trainer_id=trainer_id),
            state_ops.assign_add(contrib_framework.get_global_step(), 1))
        loss_deps.append(training_graph)
        if hasattr(graph_builder, 'finalize_training'):
            finalize_listener = EveryCheckpointPreSaveListener(
                graph_builder.finalize_training())
            scaffold = monitored_session.Scaffold()
            training_hooks.append(
                basic_session_run_hooks.CheckpointSaverHook(
                    model_dir, save_secs=600, save_steps=None,
                    scaffold=scaffold,
                    listeners=[finalize_listener]))

    training_loss = None
    if (mode == model_fn_lib.ModeKeys.EVAL or
                mode == model_fn_lib.ModeKeys.TRAIN):
        with ops.control_dependencies(loss_deps):
            training_loss = graph_builder.training_loss(
                features, labels, name='rf_training_loss')

    # Put weights back in
    if weights is not None:
        features[weights_name] = weights

    if early_stopping_rounds:
        training_hooks.append(TensorForestLossHook(early_stopping_rounds))

    return model_fn_lib.ModelFnOps(
        mode=mode,
        predictions=inference,
        loss=training_loss,
        train_op=training_graph,
        training_hooks=training_hooks,
        scaffold=scaffold,
        output_alternatives=output_alternatives)


RandomForest = {
    'estimator': {
        'args': [
            {
                "name": "weights_name",
                "type": {
                    "key": "string",
                    "des": "A string defining feature column name "
                           "representing weights.Will be multiplied by the "
                           "loss of the  example.Used to downweight or "
                           "boost examples during training.",
                },
                "default": None,
                "required": False
            },
            {
                "name": "keys_name",
                "type": {
                    "key": "string",
                    "des": "A string naming one of the features to strip "
                           "out and pass through into the inference/eval "
                           "results dict.  Useful for associating specific "
                           "examples with their prediction."
                },
                "default": None,
                "required": True
            },
            {
                "name": "num_classes",
                "type": {
                    "key": "int",
                    "des": "number of clusters to train",
                    "range": None,
                },
                "default": 1,
                "required": True
            },
            {
                "name": "num_features",
                "type": {
                    "key": "int",
                    "des": "num_features of the data set ",
                    "range": None,
                },
                "default": 1,
                "required": True
            },
            {
                "name": "num_trees",
                "type": {
                    "key": "int",
                    "des": "num_trees",
                    "range": None,
                },
                "default": 2,
                "required": True
            },
            {
                "name": "max_nodes",
                "type": {
                    "key": "int",
                    "des": "max_nodes for the tree",
                    "range": None,
                },
                "default": 1000,
                "required": True
            },
            {
                "name": "early_stopping_rounds",
                "type": {
                    "key": "int",
                    "des": "Allows training to terminate early if the"
                           " forest is no longer growing. 100 by default."
                           "  Set to a Falsy value to disable the default "
                           "training hook.",
                    "range": None,
                },
                "default": 100,
                "required": True
            },
            {
                "name": "regression",
                "type": {
                    "key": "bool",
                    "des": "True for regression, False for classification."
                           "If true, the 'num_classes' should be 1",
                    "range": None,
                },
                "default": True,
                "required": True
            },
            {
                "name": "split_after_samples",
                "type": {
                    "key": "int",
                    "des": "The tree will split after some numbers of "
                           "samples",
                    "range": None,
                },
                "default": 100,
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
