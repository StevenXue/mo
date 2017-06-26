# -*- coding: UTF-8 -*-
from keras.models import Sequential
from keras import optimizers
from keras import utils
from keras import layers


# Generate dummy data
import numpy as np
x_train = np.random.random((1000, 20))
y_train = utils.to_categorical(np.random.randint(10, size=(1000, 1)), num_classes=10)
x_test = np.random.random((100, 20))
y_test = utils.to_categorical(np.random.randint(10, size=(100, 1)), num_classes=10)


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
        model.add(layer_class(l['n'], **l['args']))

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
    {'layers': [{'name': 'Dense', 'n': 64,
                 'args': {'activation': 'relu', 'input_dim': 20}},
                {'name': 'Dropout', 'n': 0.5,
                 'args': {}},
                {'name': 'Dense', 'n': 64,
                 'args': {'activation': 'relu'}},
                {'name': 'Dropout', 'n': 0.5,
                 'args': {}},
                {'name': 'Dense', 'n': 10,
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
