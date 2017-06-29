# -*- coding: UTF-8 -*-
from keras.models import Sequential
from keras import optimizers
from keras import utils
from keras import layers

# Generate dummy data
import numpy as np

x_train = np.random.random((1000, 20))
y_train = utils.to_categorical(np.random.randint(10, size=(1000, 1)),
                               num_classes=10)
x_test = np.random.random((100, 20))
y_test = utils.to_categorical(np.random.randint(10, size=(100, 1)),
                              num_classes=10)


def sequential(obj):
    """
    a general implementation of sequential model of keras
    :param obj: config obj
    :return:
    """
    model = Sequential()
    # Dense(64) is a fully-connected layer with 64 hidden units.
    # in the first layer, you must specify the expected input data shape:
    # here, 20-dimensional vectors.
    ls = obj['layers']
    comp = obj['compile']
    f = obj['fit']
    e = obj['evaluate']

    # TODO add validator
    op = comp['optimizer']

    # loop to add layers
    for l in ls:
        # get layer class from keras
        layer_class = getattr(layers, get_value(l, 'name', 'Dense'))
        # add layer
        model.add(layer_class(l['units'], **l['args']))

    # optimiser
    sgd_class = getattr(optimizers, op['name'])
    sgd = sgd_class(**op['args'])

    # define the metrics
    # compile
    model.compile(loss=comp['loss'],
                  optimizer=sgd,
                  metrics=comp['metrics'])

    # training
    model.fit(f['x_train'], f['y_train'], **f['args'])

    # testing
    score = model.evaluate(e['x_test'], e['y_test'], **e['args'])
    print(score)


def get_value(obj, key, default):
    if obj:
        if obj[key]:
            return obj[key]
        else:
            return default
    else:
        raise ValueError


sequential(
    {'layers': [{'name': 'Dense', 'units': 64,
                 'args': {'activation': 'relu', 'input_shape': [20,]}},
                {'name': 'Dropout', 'units': 0.5,
                 'args': {}},
                {'name': 'Dense', 'units': 64,
                 'args': {'activation': 'relu'}},
                {'name': 'Dropout', 'units': 0.5,
                 'args': {}},
                {'name': 'Dense', 'units': 10,
                 'args': {'activation': 'softmax'}}
                ],
     'compile': {'loss': 'categorical_crossentropy',
                 'optimizer': {'name': 'SGD',
                               'args':
                                   {'lr': 0.01, 'decay': 1e-6, 'momentum': 0.9,
                                    'nesterov': True}
                               },
                 'metrics': ['accuracy']
                 },
     'fit': {'x_train': x_train,
             'y_train': y_train,
             'args': {
                 'epochs': 20,
                 'batch_size': 128
             }
             },
     'evaluate': {'x_test': x_test,
                  'y_test': y_test,
                  'args': {
                      'batch_size': 128
                  }
                  }
     })


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
                               'softsign,'
                               'relu',
                               'tanh',
                               'sigmoid',
                               'hard_sigmoid',
                               'linear']
                 },
                 'default': 'linear',
             },

INPUT_SHAPE = {
    'name': 'input_shape',
    'type': {
        'key': 'int',
        'des': 'Just your regular densely-connected NN layer',
        'range': None
    },
    'default': 32
}

SPEC = {
    'layers': [
        {
            'name': 'Dense',
            'args': [
                {
                    'name': 'units',
                    'type': {
                        'key': 'int',
                        'des': 'Just your regular densely-connected NN layer',
                        'range': None
                    },
                    'default': 32
                },
                ACTIVATION,
                INPUT_SHAPE
            ],
        }
    ],
    'compile': [
        {
            'name': 'loss',
            'type': {
                'key': 'choice',
                'des': 'A loss function (or objective function, or '
                       'optimization score function) is one of the two '
                       'parameters required to compile a model',
                'range': ['mean_squared_error',
                          'mean_absolute_error',
                          'mean_absolute_percentage_error',
                          'mean_squared_logarithmic_error',
                          'squared_hinge',
                          'hinge',
                          'categorical_hinge',
                          'logcosh',
                          'categorical_crossentropy',
                          'sparse_categorical_crossentropy',
                          'binary_crossentropy',
                          'kullback_leibler_divergence',
                          'poisson',
                          'cosine_proximity']
            },
            'default': 'categorical_crossentropy',
            'required': True
        },
        {
            'name': 'optimizer',
            'type': {
                'key': 'choice',
                'des': 'An optimizer is one of the two arguments required for '
                       'compiling a Keras model',
                'range': ['sgd',
                          'rmsprop',
                          'adagrad',
                          'adadelta',
                          'adam',
                          'adamax',
                          'nadam']
            },
            'default': 'sgd',
            'required': True
        },
        {
            'name': 'metrics',
            'type': {
                'key': 'choices',
                'des': 'A metric is a function that is used to judge the '
                       'performance of your model',
                'range': ['mse',
                          'mae',
                          'mape',
                          'msle',
                          'cosine']
            },
            'default': 'sgd'
        },
    ],
    'fit': {
        'x_train': x_train,
        'y_train': y_train,
        'args': [
            {
                'name': 'batch_size',
                'type': {
                    'key': 'int',
                    'des': 'Number of samples per gradient update',
                    'range': None
                },
                'default': 32
            },
            {
                'name': 'epochs',
                'type': {
                    'key': 'int',
                    'des': 'Number of epochs to train the model',
                    'range': None
                },
                'default': 10
            },
        ],
    },
    'evaluate': {
        'x_test': x_test,
        'y_test': y_test,
        'args': [
            {
                'name': 'batch_size',
                'type': {
                    'key': 'int',
                    'des': 'Number of samples per gradient update',
                    'range': None
                },
                'default': 32
            },
        ]
    }
}


PARAMETER_SPEC = [
    {
        "name": "validation",
        "type": {
            "key": "float",
            "des": "blablabla",
            "range": [0.1, 10.1]
        },
        "default": None
    },
    {
        "name": "k",
        "type": {
            "key": "int",
            "des": "blablabla",
            "range": [0, 10]
        },
        "default": 2
    },
    {
        "name": "heheda",
        "type": {
            "key": "string",
            "des": "blablabla",
        },
        "default": "买了我的瓜"
    },
    {
        "name": "validation",
        "type": {
            "key": "choice",
            "des": "blablabla",
            "range": [0, 10, 234, 5, 6]
        },
        "default": None
    },
    {
        "name": "validation",
        "type": {
            "key": "float_m",
            "des": "blablabla",
            "range": [0.1, 10.1]
        },
        "default": None,
        'len_range': [2, 2]
    },
    {
        "name": "k",
        "type": {
            "key": "int_m",
            "des": "blablabla",
            "range": [0, 10]
        },
        "default": 2,
        'len_range': [2, 3]
    },
    {
        "name": "heheda",
        "type": {
            "key": "string_m",
            "des": "blablabla",
        },
        "default": "买了我的瓜",
        'len_range': None
    },
    {
        "name": "validation",
        "type": {
            "key": "choice_m",
            "des": "blablabla",
            "range": [0, 10, 234, 5, 6],
        },
        "default": None,
        'len_range': None
    },
]