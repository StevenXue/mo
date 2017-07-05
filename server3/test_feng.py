# -*- coding: UTF-8 -*-
import csv

from keras import utils
# Generate dummy data
import numpy as np
x_train = np.random.random((1000, 20))
y_train = utils.to_categorical(np.random.randint(10, size=(1000, 1)),
                               num_classes=10)
x_test = np.random.random((100, 20))
y_test = utils.to_categorical(np.random.randint(10, size=(100, 1)),
                              num_classes=10)

print(x_train.shape)
print(y_train.shape)
print(x_test.shape)
print(y_test.shape)
train = np.concatenate((x_train, y_train), 1)
test = np.concatenate((x_test, y_test), 1)
print(train.shape)
print(test.shape)
array = np.concatenate((train, test), 0)
print(array.shape)
with open('rand.csv', 'w') as f:
    writer = csv.writer(f)
    fields = ['field%s' % i for i in range(array.shape[1])]
    writer.writerow(fields)
    for row in array:
        writer.writerow(row)
