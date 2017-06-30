# -*- coding: UTF-8 -*-
from keras import utils
# Generate dummy data
import numpy as np
from entity.model import Model

x_train = np.random.random((1000, 20))
y_train = utils.to_categorical(np.random.randint(10, size=(1000, 1)),
                               num_classes=10)
x_test = np.random.random((100, 20))
y_test = utils.to_categorical(np.random.randint(10, size=(100, 1)),
                              num_classes=10)
conf = {'layers': [{'name': 'Dense', 'units': 64,
                    'args': {'activation': 'relu', 'input_dim': 20}},
                   {'name': 'Dropout', 'units': 0.5,
                    'args': {}},
                   {'name': 'Dense', 'units': 64,
                    'args': {'activation': 'relu'}},
                   {'name': 'Dropout', 'units': 0.5,
                    'args': {}},
                   {'name': 'Dense', 'units': 10,
                    'args': {'activation': 'softmax'}}
                   ],
        'compile': {'loss': 'categorical_crossentropy',
                    'optimizer': {'name': 'SGD',
                                  'args':
                                      {'lr': 0.01, 'decay': 1e-6,
                                       'momentum': 0.9,
                                       'nesterov': True}
                                  },
                    'metrics': ['accuracy']
                    },
        'fit': {'x_train': 'x_train',
                'y_train': 'y_train',
                'args': {
                    'epochs': 20,
                    'batch_size': 128
                }
                },
        'evaluate': {'x_test': 'x_test',
                     'y_test': 'y_test',
                     'args': {
                         'batch_size': 128
                     }
                     }
        }
m = Model()
m.to_code(conf)
