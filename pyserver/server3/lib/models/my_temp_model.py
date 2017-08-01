from hyperas.distributions import choice, uniform
from keras.models import Sequential
from hyperopt import Trials, STATUS_OK, tpe
from keras.layers import Dense
from keras.layers import Dropout
from keras.layers import Dense
from keras.layers import Dropout
from keras.layers import Dense
from keras.optimizers import SGD
from keras.optimizers import RMSprop


def my_data_function_template():
    conf = {'layers': [{'name': 'Dense', 'args': {'units': 64, 'activation': 'relu', 'input_shape': [3]}}, {'name': 'Dropout', 'args': {'rate': {'distribute': 'uniform', 'value': '0, 0.8'}}}, {'name': 'Dense', 'args': {'units': 64, 'activation': 'relu'}}, {'name': 'Dropout', 'args': {'rate': 0.5}}, {'name': 'Dense', 'args': {'units': 2, 'activation': 'softmax'}}], 'compile': {'loss': 'categorical_crossentropy', 'metrics': ['accuracy']}, 'fit': {'data_fields': [['age', 'capital_gain', 'education_num'], ['capital_loss', 'hours_per_week']], 'args': {'batch_size': 128, 'epochs': 20}}, 'evaluate': {'args': {'batch_size': 128}}}
    data_source_id = '5965cda1d123ab8f604a8dd0'
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
    model.add(Dense(units=64, activation='relu', input_shape=[3]))
    model.add(Dropout(rate={{uniform(0, 0.8)}}))
    model.add(Dense(units=64, activation='relu'))
    model.add(Dropout(rate=0.5))
    model.add(Dense(units=2, activation='softmax'))
    model.compile(optimizer=SGD(), loss='categorical_crossentropy', metrics=['accuracy'])
    model.fit(x_train, y_train,  validation_data=(x_test, y_test), batch_size=128, epochs=20, verbose=0)
    score, acc = model.evaluate(x_test, y_test, batch_size=128)
    return {'loss': -acc, 'status': STATUS_OK, 'model': model}
    
    