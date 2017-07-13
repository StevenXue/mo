# -*- coding: UTF-8 -*-

# from keras import utils
# Generate dummy data
# import numpy as np
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
from bson import ObjectId
from flask import jsonify
import json

from server3.business import data_business
from server3.utility import json_utility
from datetime import datetime

data = data_business.get_by_data_set_limit(ObjectId('5966eb29d123abad6fb9c8bb'),
                                           10)
print(data)
data = [d.to_mongo() for d in data]
# print(data)
data = [json_utility.convert_to_json(d) for d in data]
print(data)


