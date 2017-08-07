# -*- coding: UTF-8 -*-
"""

"""
from keras import layers
from keras.models import Sequential
import tensorflow as tf
from keras import optimizers

graph = tf.get_default_graph()


def keras_seq(conf, **kw):
    """
    a general implementation of sequential model of keras
    :param conf: config dict
    :return:
    """
    result_sds = kw.pop('result_sds', None)
    if result_sds is None:
        raise RuntimeError('no result sds id passed to model')

    with graph.as_default():
        model = Sequential()
        # Dense(64) is a fully-connected layer with 64 hidden units.
        # in the first layer, you must specify the expected input data shape:
        # here, 20-dimensional vectors.
        ls = conf['layers']
        comp = conf['compile']
        f = conf['fit']
        e = conf['evaluate']

        # TODO add validator
        # op = comp['optimizer']

        # loop to add layers
        for l in ls:
            # get layer class from keras
            layer_class = getattr(layers, l['name'])
            # add layer
            model.add(layer_class(**l['args']))

        # optimiser
        optimizers_class = getattr(optimizers, comp['optimizer']['name'])

        # some optimiser does not have momentum
        if comp['optimizer']['name'] != 'SGD':
            comp['optimizer']['args'].pop('momentum')
        optimizer = optimizers_class(**comp['optimizer']['args'])

        # define the metrics
        # compile
        model.compile(loss=comp['loss'],
                      optimizer=optimizer,
                      metrics=comp['metrics'])

        # batch_print_callback = LambdaCallback(on_epoch_end=
        #                                       lambda epoch, logs:
        #                                       logger.log_epoch_end(epoch, logs,
        #                                                            result_sds))

        # training
        # TODO callback 改成异步，考虑 celery
        model.fit(f['x_train'], f['y_train'],
                  validation_data=(f['x_val'], f['y_val']),
                  callbacks=[],
                  verbose=0,
                  **f['args'])

        # testing
        score = model.evaluate(e['x_test'], e['y_test'], **e['args'])

        weights = model.get_weights()

        config = model.get_config()
        return score


if __name__ == '__main__':
    pass
    # hyper_parameters_to_grid(hyper_parameters)
    # get_conf_grid(generate_conf(), hyper_parameters)
    # get_grid_of_layer(None)


ACTIVATION = {
    'name': 'activation',
    'type': {
        'key': 'choice',
        'des': 'Activation function to use (see activations). If you don\'t '
               'specify anything, no activation is applied (ie. linear '
               'activation: a(x) = x).',
        'range': ['softmax',
                  'elu',
                  'selu',
                  'softplus',
                  'softsign',
                  'relu',
                  'tanh',
                  'sigmoid',
                  'hard_sigmoid',
                  'linear']
    },
    'default': 'linear',
}

INPUT_SHAPE = {
    'name': 'input_shape',
    'type': {
        'key': 'int_m',
        'des': 'nD tensor with shape: (batch_size, ..., '
               'input_dim). The most common situation would be a '
               '2D input with shape (batch_size, input_dim).',
        'range': None
    },
    'default': None,
    'required': False,
    'len_range': None
}


DISTRIBUTE = {
    'name': 'distribute',
    'type': {
        'key': 'choice',
        'des': 'Distribute of the value of hyperparameters.',
        'range': [
            {
                'name': "uniform",
                'type': {
                    'key': 'range',
                    'des': 'Uniform distribute',
                    'range': None
                }

            }
        ]
    }
}


CONSTANT = {
    # test conf template for backend use
    "TEST_CONF": {
        "layers": [
            {
                "name": "Dense",
                "args": {"units": 64, "activation": "relu",
                         "input_shape": [
                             20, ],
                         "init": "uniform"
                         }
            },
            {
                "name": "Dropout",
                "args": {"rate": 0.5}},
            {
                "name": "Dense",
                "args": {"units": 64, "activation": "relu"}},
            {
                "name": "Dropout",
                "args": {"rate": 0.5}},
            {
                "name": "Dense",
                "args": {"units": 10, "activation": "softmax"}}
        ],
        "compile": {
            "loss": "categorical_crossentropy",
            "optimizer": {"name": "SGD",
                          "args": {"lr": 0.01, "momentum": 0}},
            "metrics": ["accuracy"]
        },
        "fit": {
            "x_train": "x_train",
            "y_train": "y_train",
            "x_val": "x_test",
            "y_val": "y_test",
            "args": {
                "epochs": 20,
                "batch_size": 128
            }
        },
        "evaluate": {
            "x_test": "x_test",
            "y_test": "y_test",
            "args": {
                "batch_size": 128
            }
        }
    },

    # spark models json for frontend use
    "SPARK_MODELS": {
        "layers": [
            {
                "name": "Dense",
                "args": [
                    {
                        "name": "units",
                        "type": {
                            "key": "int",
                            "des": "Just your regular densely-connected NN layer",
                            "range": None
                        },
                        "default": 32,
                        "required": True
                    },
                    ACTIVATION,
                    INPUT_SHAPE
                ],
            }
        ]


    }
}
