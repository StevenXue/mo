import logging

import numpy as np
import tensorflow as tf
from lib.models.custom_log_handler import MetricsHandler


def custom_model(model, **kw):
    """

    :param model:
    :param kw:
    :return:
    """

    result_sds = kw.pop('result_sds', None)
    if result_sds is None:
        raise RuntimeError('no result sds id passed to model')

    tf.logging.set_verbosity(tf.logging.INFO)
    mh = MetricsHandler()
    mh.result_sds_id = result_sds
    logger = logging.getLogger('tensorflow')
    logger.setLevel(logging.DEBUG)
    logger.addHandler(mh)

    estimator = tf.contrib.learn.Estimator(model_fn=model)
    # define our data sets
    x_train = np.array([1., 2., 3., 4.])
    y_train = np.array([0., -1., -2., -3.])
    x_eval = np.array([2., 5., 8., 1.])
    y_eval = np.array([-1.01, -4.1, -7, 0.])
    input_fn = tf.contrib.learn.io.numpy_input_fn({"x": x_train}, y_train, 4,
                                                  num_epochs=1000)
    eval_input_fn = tf.contrib.learn.io.numpy_input_fn({"x": x_eval}, y_eval, 4,
                                                       num_epochs=1000)
    # train
    estimator.fit(input_fn=input_fn, steps=1000)
    # Here we evaluate how well our model did.
    train_loss = estimator.evaluate(input_fn=input_fn)
    eval_loss = estimator.evaluate(input_fn=eval_input_fn)
    print("train loss: %r" % train_loss)
    print("eval loss: %r" % eval_loss)


# Declare list of features, we only have one real-valued feature
def linear_regressor(features, labels, mode):
    # Build a linear model and predict values
    W = tf.get_variable("W", [1], dtype=tf.float64)
    b = tf.get_variable("b", [1], dtype=tf.float64)
    y = W * features['x'] + b
    # Loss sub-graph
    loss = tf.reduce_sum(tf.square(y - labels))
    # Training sub-graph
    global_step = tf.train.get_global_step()
    optimizer = tf.train.GradientDescentOptimizer(0.01)
    train = tf.group(optimizer.minimize(loss),
                     tf.assign_add(global_step, 1))
    # ModelFnOps connects subgraphs we built to the
    # appropriate functionality.
    return tf.contrib.learn.ModelFnOps(
        mode=mode, predictions=y,
        loss=loss,
        train_op=train)

if __name__ == '__main__':
    pass

    from business import staging_data_set_business
    sds = staging_data_set_business.get_by_id('595cb76ed123ab59779604c3')
    custom_model(linear_regressor, result_sds=sds)
