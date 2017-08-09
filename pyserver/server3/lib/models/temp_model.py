#coding=utf-8

try:
    import inspect
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
    from keras.models import Sequential
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
    from my_temp_model import model_function, my_data_function_template
except:
    pass

try:
    from server3.service.model_service import manage_nn_input
except:
    pass
from hyperopt import fmin, tpe, hp, STATUS_OK, Trials
from hyperas.distributions import conditional

conf = {'layers': [{'name': 'Dense', 'args': {'units': {'distribute': 'uniform', 'value': '0, 1'}, 'activation': {'distribute': 'choice', 'value': ['relu']}, 'input_shape': [3]}, 'index': 0}, {'name': 'Dropout', 'args': {'rate': {'distribute': 'choice', 'value': [0.1, 0.2, 0.4]}}, 'index': 1}, {'name': 'Dense', 'args': {'units': 64, 'activation': 'softmax'}, 'index': 2}], 'compile': {'args': {'loss': ['categorical_crossentropy', 'hinge'], 'metrics': ['acc'], 'hype_loss': True}}, 'fit': {'data_fields': [['alm', 'erl', 'gvh'], ['mit', 'nuc']], 'args': {'batch_size': 100, 'epochs': 10}}, 'evaluate': {'args': {'batch_size': 100}}}
data_source_id = '598af547e89bdec0f544b427'
kwargs = {'schema': 'seq'}

from server3.service.model_service import manage_nn_input
input = manage_nn_input(conf, data_source_id, **kwargs)
x_train = input["x_tr"]
y_train = input["y_tr"]
x_test = input["x_te"]
y_test = input["y_te"]


def keras_fmin_fnct(space):

    model = Sequential()
    model.add(Dense(units=space['units'], activation=space['activation'], input_shape=[3]))
    model.add(Dropout(rate=space['rate']))
    model.add(Dense(units=64, activation='softmax'))
    model.compile(optimizer=SGD(lr=space['units_1'], momentum=10), loss=['categorical_crossentropy', 'hinge'], metrics=['acc'], hype_loss=True)
    model.fit(x_train, y_train,  validation_data=(x_test, y_test), batch_size=100, epochs=10, verbose=0)
    score, acc = model.evaluate(x_test, y_test, batch_size=100)
    return {'loss': -acc, 'status': STATUS_OK, 'model': model}

def get_space():
    return {
        'units': hp.uniform('units', 0, 1),
        'activation': hp.choice('activation', ['relu']),
        'rate': hp.choice('rate', [0.1, 0.2, 0.4]),
        'units_1': hp.uniform('units_1', 0, 1),
    }
