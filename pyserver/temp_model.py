#coding=utf-8

try:
    import inspect
except:
    pass

try:
    import os
except:
    pass

try:
    from keras.datasets import mnist
except:
    pass

try:
    from keras.utils import np_utils
except:
    pass

try:
    from hyperas import optim
except:
    pass

try:
    from hyperopt import Trials, tpe
except:
    pass

try:
    from hyperas.distributions import choice, uniform
except:
    pass

try:
    from hyperopt import STATUS_OK
except:
    pass

try:
    from keras.layers import Dense, Dropout
except:
    pass

try:
    from keras.optimizers import SGD
except:
    pass

try:
    from keras.optimizers import RMSprop
except:
    pass

try:
    from server3.lib import Sequential
except:
    pass

try:
    from server3.lib import graph
except:
    pass

try:
    import my_temp_model
except:
    pass

try:
    from server3.service.model_service import manage_nn_input
except:
    pass
from hyperopt import fmin, tpe, hp, STATUS_OK, Trials
from hyperas.distributions import conditional

conf = {'layers': [{'name': 'Dense', 'args': {'units': {'distribute': 'choice', 'value': [16, 32, 64]}, 'activation': {'distribute': 'choice', 'value': ['linear', 'relu']}, 'input_shape': [4]}, 'index': 0}, {'name': 'Dropout', 'args': {'rate': {'distribute': 'uniform', 'value': '0, 0.5'}}, 'index': 1}, {'name': 'Dense', 'args': {'units': 2, 'activation': 'softmax'}, 'index': 2}], 'compile': {'args': {'loss': {'distribute': 'choice', 'value': ['categorical_crossentropy', 'hinge']}, 'metrics': ['acc']}}, 'fit': {'data_fields': [['alm', 'erl', 'gvh', 'mcg'], ['mit', 'nuc']], 'args': {'batch_size': 128, 'epochs': 10}}, 'evaluate': {'args': {'batch_size': 128}}}
data_source_id = '598bd9010c11f33b69e5f6c4'
kwargs = {'schema': 'cv'}

from server3.service.model_service import manage_nn_input
input = manage_nn_input(conf, data_source_id, **kwargs)
x_train = input["x_tr"]
y_train = input["y_tr"]
x_test = input["x_te"]
y_test = input["y_te"]


def keras_fmin_fnct(space):

    with graph.as_default():
        model = Sequential()
        model.add(Dense(units=space['units'], activation=space['activation'], input_shape=[4]))
        model.add(Dropout(rate=space['rate']))
        model.add(Dense(units=2, activation='softmax'))
        model.compile(optimizer=SGD(lr=space['lr']), loss=space['loss'], metrics=['acc'])
        model.fit(x_train, y_train,  validation_data=(x_test, y_test), batch_size=128, epochs=10, verbose=0)
        score, acc = model.evaluate(x_test, y_test, batch_size=128)
        return {'loss': -acc, 'status': STATUS_OK, 'model': model}

def get_space():
    return {
        'units': hp.choice('units', [16, 32, 64]),
        'activation': hp.choice('activation', ['linear', 'relu']),
        'rate': hp.uniform('rate', 0, 0.5),
        'lr': hp.uniform('lr', 0, 0.05),
        'loss': hp.choice('loss', ['categorical_crossentropy', 'hinge']),
    }
