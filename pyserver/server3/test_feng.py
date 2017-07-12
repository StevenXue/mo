# -*- coding: UTF-8 -*-
import csv

from keras import utils
# Generate dummy data
import numpy as np
# x_train = np.random.random((1000, 20))
# y_train = utils.to_categorical(np.random.randint(10, size=(1000, 1)),
#                                num_classes=10)
# x_test = np.random.random((100, 20))
# y_test = utils.to_categorical(np.random.randint(10, size=(100, 1)),
#                               num_classes=10)
#
# print(x_train.shape)
# print(y_train.shape)
# print(x_test.shape)
# print(y_test.shape)
# train = np.concatenate((x_train, y_train), 1)
# test = np.concatenate((x_test, y_test), 1)
# print(train.shape)
# print(test.shape)
# array = np.concatenate((train, test), 0)
# print(array.shape)
# with open('rand.csv', 'w') as f:
#     writer = csv.writer(f)
#     fields = ['field%s' % i for i in range(array.shape[1])]
#     writer.writerow(fields)
#     for row in array:
#         writer.writerow(row)

# from flask_socketio import SocketIO
#
# socketio = SocketIO(message_queue='redis://')
# socketio.emit('log_epoch_end', {'step': 111, 'loss': 222, 'acc': 333},
#               namespace='/log')
import keras
from keras.models import Sequential
from keras.layers import Dense, Dropout, Activation
from keras.optimizers import SGD

# Generate dummy data
import numpy as np
x_train = np.random.random((1000, 20))
y_train = keras.utils.to_categorical(np.random.randint(10, size=(1000, 1)), num_classes=10)
x_test = np.random.random((100, 20))
y_test = keras.utils.to_categorical(np.random.randint(10, size=(100, 1)), num_classes=10)

model = Sequential()
# Dense(64) is a fully-connected layer with 64 hidden units.
# in the first layer, you must specify the expected input data shape:
# here, 20-dimensional vectors.
model.add(Dense(64, activation='relu', input_dim=20))
model.add(Dropout(0.5))
model.add(Dense(64, activation='relu'))
model.add(Dropout(0.5))
model.add(Dense(10, activation='softmax'))

sgd = SGD(lr=0.01, decay=1e-6, momentum=0.9, nesterov=True)
model.compile(loss='categorical_crossentropy',
              optimizer=sgd,
              metrics=['accuracy'])

model.fit(x_train, y_train,
          epochs=20,
          batch_size=128)
score = model.evaluate(x_test, y_test, batch_size=128)
