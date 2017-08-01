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


def model_function(x_train, y_train, x_test, y_test):
    model = Sequential()
    model.add(Dense(units=512, input_shape=[784], activation='relu'))
    model.add(Dropout(rate={{uniform(0, 0.2)}}))
    model.add(Dense(units={{choice([256, 512, 1024])}}, activation='relu'))
    model.add(Dropout(rate={{uniform(0, 1)}}))
    model.add(Dense(units=10, activation='softmax'))
    model.compile(optimizer=RMSprop(lr=0.001), loss='categorical_crossentropy', metrics=['accuracy'])
    model.fit(x_train, y_train,  validation_data=(x_test, y_test), epochs={{choice([1])}}, batch_size={{choice([64, 128])}}, verbose=0)
    score, acc = model.evaluate(x_test, y_test, batch_size={{choice([64])}})
    return {'loss': -acc, 'status': STATUS_OK, 'model': model}