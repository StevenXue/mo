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


def sequential_to_str(obj):
    """
    a general implementation of sequential model of keras
    :param obj: config obj
    :return:
    """
    #     model = Sequential()
    # Dense(64) is a fully-connected layer with 64 hidden units.
    # in the first layer, you must specify the expected input data shape:
    # here, 20-dimensional vectors.
    ls = obj['layers']
    comp = obj['compile']
    f = obj['fit']
    e = obj['evaluate']
    str_model = 'model = Sequential()\n'
    op = comp['optimizer']
    for l in ls:
        layer_name = get_value(l, 'name', 'Dense')
        layer_units = get_value(l, 'units', 0)
        if get_args(l):
            str_model += 'model.add(%s(%s, %s))' % (
            layer_name, layer_units, get_args(l)[:-2]) + '\n'
        else:
            str_model += 'model.add(%s(%s))' % (layer_name, layer_units) + '\n'

    optimizers_name = get_value(op, 'name', 'SGD')
    str_model += 'optimizers = %s(%s)' % (optimizers_name, get_args(op)[:-2]) + '\n'
    str_model += "model.compile(loss='" + get_value(comp, 'loss',
                                                'categorical_crossentropy') + "', optimizer=optimizers, metrics= [" + get_metrics(
    comp) + "])\n"
    str_model += "model.fit(x_train, y_train, " + get_args(f)[:-2] + ")\n"
    str_model += "score = model.evaluate(x_test, y_test, " + get_args(e)[
                                                         :-2] + ")\n"

    print(str_model)


def get_metrics(obj):
    temp_str = ''
    for i in obj['metrics']:
        temp_args = i
        if type(temp_args) is str:
            temp_str += "'" + str(temp_args) + "',"
        else:
            temp_str += str(temp_args) + ', '

    return temp_str[:-1]


def get_args(obj):
    temp_str = ''
    for i in obj['args']:
        temp_args = get_value(obj['args'], i, 0)
        if type(temp_args) is str:
            temp_str += str(i) + "='" + str(temp_args) + "', "
        else:
            temp_str += str(i) + '=' + str(temp_args) + ', '
    return temp_str


sequential(
    {'layers': [{'name': 'Dense', 'units': 64,
                 'args': {'activation': 'relu', 'input_dim': 20}},
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
