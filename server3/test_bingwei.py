# -*- coding: UTF-8 -*-

from service.model_service import run_multiple_model


def generate_conf():
    # 获取数据
    from keras import utils
    import numpy as np
    x_train = np.random.random((1000, 20))
    y_train = utils.to_categorical(np.random.randint(10, size=(1000, 1)), num_classes=10)
    x_test = np.random.random((100, 20))
    y_test = utils.to_categorical(np.random.randint(10, size=(100, 1)), num_classes=10)
    # x_train = []
    # y_train = []
    # x_test = []
    # y_test = []
    TEST_CONF = {'layers': [{'name': 'Dense',
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
                 'fit': {'x_train': x_train,
                         'y_train': y_train,
                         'x_val': x_test,
                         'y_val': y_test,
                         'args': {
                             'epochs': [20, 30],
                             'batch_size': [128, 256]
                         }
                         },
                 'evaluate': {'x_test': x_test,
                              'y_test': y_test,
                              'args': {
                                  'batch_size': 128
                              }
                              }
                 }
    # question: is the value of batch size same as the fit
    return TEST_CONF


if __name__ == '__main__':
    result = run_multiple_model(generate_conf(), None, None, None)
    print(result)

