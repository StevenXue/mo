from hyperas.distributions import choice, uniform
from keras.models import Sequential
from hyperopt import Trials, STATUS_OK, tpe
from keras.layers import Dense
from keras.layers import Dropout
from keras.layers import Dense
from keras.optimizers import SGD
from keras.optimizers import RMSprop


def my_data_function_template():
    conf = {'layers': [{'name': 'Dense', 'args': {'units': {'distribute': 'uniform', 'value': '0, 1'}, 'activation': {'distribute': 'choice', 'value': ['relu']}, 'input_shape': [3]}, 'index': 0}, {'name': 'Dropout', 'args': {'rate': {'distribute': 'choice', 'value': [0.1, 0.2, 0.4]}}, 'index': 1}, {'name': 'Dense', 'args': {'units': 64, 'activation': 'softmax'}, 'index': 2}], 'compile': {'args': {'loss': ['categorical_crossentropy', 'hinge'], 'metrics': ['acc'], 'hype_loss': True}}, 'fit': {'data_fields': [['alm', 'erl', 'gvh'], ['mit', 'nuc']], 'args': {'batch_size': 100, 'epochs': 10}}, 'evaluate': {'args': {'batch_size': 100}}}
    data_source_id = '598af547e89bdec0f544b427'
    kwargs = {'schema': 'seq'}

    from server3.service.model_service import manage_nn_input
    input = manage_nn_input(conf, data_source_id, **kwargs)
    x_train = input["x_tr"]
    y_train = input["y_tr"]
    x_test = input["x_te"]
    y_test = input["y_te"]
    return x_train, y_train, x_test, y_test


def model_function(x_train, y_train, x_test, y_test):
    model = Sequential()
    model.add(Dense(units={{uniform(0, 1)}}, activation={{choice(['relu'])}}, input_shape=[3]))
    model.add(Dropout(rate={{choice([0.1, 0.2, 0.4])}}))
    model.add(Dense(units=64, activation='softmax'))
    model.compile(optimizer=SGD(lr={{uniform(0, 1)}}, momentum=10), loss=['categorical_crossentropy', 'hinge'], metrics=['acc'], hype_loss=True)
    model.fit(x_train, y_train,  validation_data=(x_test, y_test), batch_size=100, epochs=10, verbose=0)
    score, acc = model.evaluate(x_test, y_test, batch_size=100)
    return {'loss': -acc, 'status': STATUS_OK, 'model': model}
    
    