#coding=utf-8

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
    from my_temp_model import model_function
except:
    pass
from hyperopt import fmin, tpe, hp, STATUS_OK, Trials
from hyperas.distributions import conditional

'''
Data providing function:

This function is separated from model() so that hyperopt
won't reload data for each evaluation run.
'''
(x_train, y_train), (x_test, y_test) = mnist.load_data()
x_train = x_train.reshape(60000, 784)
x_test = x_test.reshape(10000, 784)
x_train = x_train.astype('float32')
x_test = x_test.astype('float32')
x_train /= 255
x_test /= 255
nb_classes = 10
y_train = np_utils.to_categorical(y_train, nb_classes)
y_test = np_utils.to_categorical(y_test, nb_classes)



def keras_fmin_fnct(space):

    model = Sequential()
    model.add(Dense(units=512, input_shape=[784], activation='relu'))
    model.add(Dropout(rate=space['rate']))
    model.add(Dense(units=space['units'], activation='relu'))
    model.add(Dropout(rate=space['rate_1']))
    model.add(Dense(units=10, activation='softmax'))
    model.compile(optimizer=RMSprop(lr=0.001), loss='categorical_crossentropy', metrics=['accuracy'])
    model.fit(x_train, y_train,  validation_data=(x_test, y_test), epochs=space['epochs'], batch_size=space['batch_size'], verbose=0)
    score, acc = model.evaluate(x_test, y_test, batch_size=space['batch_size_1'])
    return {'loss': -acc, 'status': STATUS_OK, 'model': model}

def get_space():
    return {
        'rate': hp.uniform('rate', 0, 0.2),
        'units': hp.choice('units', [256, 512, 1024]),
        'rate_1': hp.uniform('rate_1', 0, 1),
        'epochs': hp.choice('epochs', [1]),
        'batch_size': hp.choice('batch_size', [64, 128]),
        'batch_size_1': hp.choice('batch_size_1', [64]),
    }
