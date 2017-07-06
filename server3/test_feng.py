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

x_fields = ['field%s' % i for i in range(20)]
y_fields = ['field%s' % i for i in range(20, 30)]
conf = {'layers': [{'name': 'Dense',
                    'args': {'units': 64, 'activation': 'relu',
                             'input_shape': [
                                 20, ]}},
                   {'name': 'Dropout',
                    'args': {'rate': 0.5}},
                   {'name': 'Dense',
                    'args': {'units': 64, 'activation': 'relu'}},
                   {'name': 'Dropout',
                    'args': {'rate': 0.5}},
                   {'name': 'Dense',
                    'args': {'units': 10, 'activation': 'softmax'}}
                   ],
        'compile': {'loss': 'categorical_crossentropy',
                    'optimizer': 'SGD',
                    'metrics': ['accuracy']
                    },
        'fit': {'x_train': x_fields,
                'y_train': y_fields,
                'args': {
                    'epochs': 20,
                    'batch_size': 128
                }
                },
        'evaluate': {'x_test': x_fields,
                     'y_test': y_fields,
                     'args': {
                         'batch_size': 128
                     }
                     }
        }
project_id = "595b4bf8e89bde931433f466"
staging_data_set_id = "595c970144a6372a23cb3da2"
model_id = "59562a76d123ab6f72bcac23"
schema = "seq"
import json
print(json.dumps(conf))
