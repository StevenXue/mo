from hyperas.distributions import choice, uniform
from keras.models import Sequential
from hyperopt import Trials, STATUS_OK, tpe
from keras.layers import Dense
from keras.layers import Dropout
from keras.layers import Dense
from keras.optimizers import SGD
from keras.optimizers import RMSprop


def my_data_function_template():
    conf = {'layers': [{'name': 'Dense', 'args': {'units': {'distribute': 'choice', 'value': [32, 64]}, 'activation': {'distribute': 'choice', 'value': ['linear', 'relu']}, 'input_shape': [4]}, 'index': 0}, {'name': 'Dropout', 'args': {'rate': {'distribute': 'uniform', 'value': '0, 0.5'}}, 'index': 1}, {'name': 'Dense', 'args': {'units': 2, 'activation': {'distribute': 'choice', 'value': ['softmax']}}, 'index': 2}], 'compile': {'args': {'loss': {'distribute': 'choice', 'value': ['categorical_crossentropy', 'squared_hinge']}, 'metrics': ['acc']}}, 'fit': {'data_fields': [['alm', 'erl', 'gvh', 'mcg'], ['mit', 'nuc']], 'args': {'batch_size': 128, 'epochs': 10}}, 'evaluate': {'args': {'batch_size': 128}}}
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
    model.add(Dense(units={{choice([32, 64])}}, activation={{choice(['linear', 'relu'])}}, input_shape=[4]))
    model.add(Dropout(rate={{uniform(0, 0.5)}}))
    model.add(Dense(units=2, activation={{choice(['softmax'])}}))
    model.compile(optimizer=SGD(lr=0.01), loss={{choice(['categorical_crossentropy', 'squared_hinge'])}}, metrics=['acc'])
    model.fit(x_train, y_train,  validation_data=(x_test, y_test), batch_size=128, epochs=10, verbose=0)
    score, acc = model.evaluate(x_test, y_test, batch_size=128)
    return {'loss': -acc, 'status': STATUS_OK, 'model': model}
    
    