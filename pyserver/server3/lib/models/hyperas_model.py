# -*- coding: UTF-8 -*-
"""
use hyperas to tune hyperparameters

Author: Bingwei Chen
Date: 2017.07.28

1. define the JSON to frontend
2. JSON template got from frontend(ok)
3. transfer JSON to hyperas model string (ok)
4. transfer string model code

cause:
1. data function use import global_variable to achieve get data
2. function principle, from big function to small

"""
from keras.datasets import mnist
from keras.utils import np_utils

from hyperas import optim

from hyperopt import Trials, tpe

# import the module used in temp_model (don't delete)

# distribution
from hyperas.distributions import choice, uniform
from keras.models import Sequential
from hyperopt import STATUS_OK
from keras.layers import Dense, Dropout
from keras.optimizers import SGD
from keras.optimizers import RMSprop


def train_hyperas_model():
    # generate my_temp_model python file
    conf1 = CONSTANT["MNIST_CONF"]
    conf_to_python_file(conf1)

    X_train, Y_train, X_test, Y_test = data()

    from my_temp_model import model_function
    model = model_function
    best_run, best_model = optim.minimize(model=model,
                                          data=data,
                                          algo=tpe.suggest,
                                          max_evals=5,
                                          trials=Trials())

    print("Evalutation of best performing model:")
    print(best_model.evaluate(X_test, Y_test))


def data():
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

    return x_train, y_train, x_test, y_test


def conf_to_python_file(conf):
    """conf to python file

    :param conf:
    :return:
    """
    import_str = conf_to_import_str(conf)

    # function name
    function_name = 'def model_function(x_train, y_train, x_test, y_test):\n'
    model_str = conf_to_model_str(conf)
    model_str = get_indent(model_str)
    model_function_str = function_name + model_str

    temp_file = './my_temp_model.py'
    write_temp_files(import_str+model_function_str, temp_file)
    return


def conf_to_import_str(conf):
    """get import string

    :param conf:
    :return:
    """
    # get import
    import_basic_str = 'from hyperas.distributions import choice, uniform\n' \
                       'from keras.models import Sequential\n' \
                       'from hyperopt import Trials, STATUS_OK, tpe\n'
    import_str = import_basic_str
    # layers
    ls = conf["layers"]
    for l in ls:
        # layer import
        import_str += 'from keras.layers import %s\n' % l['name']
    # optimizer
    import_str += 'from keras.optimizers import SGD\n' \
                  'from keras.optimizers import RMSprop\n'

    return import_str + '\n\n'


def get_indent(string):
    """add indent to function string

    :param string:
    :return:
    """
    lines = string.split('\n')
    for i in range(len(lines)):
        lines[i] = '    ' + lines[i]
    lines = '\n'.join(lines)
    return lines


def conf_to_model_str(conf):
    """conf to model string

    :param conf: conf of hyperparameters turning
    :return: model_str(model function string)
    """
    # get model function
    model_str = 'model = Sequential()\n'
    # layers
    ls = conf["layers"]
    for l in ls:
        # layer
        model_str += 'model.add(%s)\n' % function_to_string(l)

    # compile
    comp = conf["compile"]

    optimizer = comp.pop("optimizer")  # get optimizer
    optimizer_str = 'optimizer=%s, ' % function_to_string(optimizer)
    comp_str = optimizer_str

    if args_to_str(comp):
        comp_str += args_to_str(comp)
    model_str += "model.compile(%s)\n" % comp_str

    # fit
    fit = conf["fit"]
    fit_str = "model.fit(x_train, y_train,  validation_data=(x_test, y_test), " \
              "%s, verbose=0)\n" % args_to_str(fit["args"])
    model_str += fit_str

    # evaluate
    evaluate = conf["evaluate"]
    evaluate_str = "score, acc = model.evaluate(x_test, y_test, %s)\n" % args_to_str(evaluate["args"])
    model_str += evaluate_str

    # return value
    return_str = "return {'loss': -acc, 'status': STATUS_OK, 'model': model}"
    model_str += return_str
    return model_str


def function_to_string(obj):
    """ function of conf to string, the obj need name and args

    {
                "name": "Dense",
                "args": {
                    "units": {
                        "distribute": "choice",
                        "value": [256, 512]
                    },
                    "activation": {
                        "distribute": "choice",
                        "value": ["relu"]
                    },
                    "input_shape": [20],
                    "init": "uniform"
                }
            }

    :param obj: obj of the function
    :return:
    """
    name = obj["name"]
    args = obj["args"]
    args_str = args_to_str(args)
    if (type(name) is dict) and "distribute" in name:
        # {{choice([SGD(),SGD()])}}
        function_in_str = ''
        for v in name["value"]:
            part_str = '%s(%s), ' % (v, args_str)
            function_in_str += part_str
        function_str = '{{%s([%s])}}' % (name["distribute"], function_in_str[:-2])
    else:
        function_str = '%s(%s)' % (name, args_str)
    return function_str


def args_to_str(args):
    """

    "args": {
                    "units": {
                        "distribute": "choice",
                        "value": [256, 512]
                    },
                    "activation": {
                        "distribute": "choice",
                        "value": ["relu"]
                    },
                    "input_shape": [20],
                    "init": "uniform"
                }

    :param args: args of conf
    :return: args_str
    eg: (unit={{choice([256,512])}}, activation={{choice(["relu"])}}, input_shape=[20])
    """
    args_str = ''
    for key, value in args.items():
        # decide whether distribute or normal
        args_str += arg_to_string(key, value)
    # -2 used to delete the last comma(",")
    return args_str[:-2]


def arg_to_string(key, value):
    """ arg of conf to string

    :param key:
    :param value:
    :return:
    """
    if (type(value) is dict) and "distribute" in value:
        # distribute value: units={{choice([256, 512])}}
        arg_str = '%s={{%s(%s)}}, ' % (key, value["distribute"], str(value["value"]))
    else:
        # normal value: input_shape="uniform"
        if type(value) is str:
            arg_str = str(key) + "='" + str(value) + "', "
        else:
            arg_str = str(key) + '=' + str(value) + ', '
    return arg_str


def write_temp_files(tmp_str, path='./temp_model.py'):
    """ write python string to temp file

    :param tmp_str:
    :param path:
    :return:
    """
    with open(path, 'w') as f:
        f.write(tmp_str)
        f.close()
    return


ACTIVATION = {
    'name': 'activation',
    'type': {
        'key': 'choice',
        'des': 'Activation function to use (see activations). If you don\'t '
               'specify anything, no activation is applied (ie. linear '
               'activation: a(x) = x).',
        'range': ['softmax',
                  'elu',
                  'selu',
                  'softplus',
                  'softsign',
                  'relu',
                  'tanh',
                  'sigmoid',
                  'hard_sigmoid',
                  'linear']
    },
    'default': 'linear',
}

INPUT_SHAPE = {
    'name': 'input_shape',
    'type': {
        'key': 'int_m',
        'des': 'nD tensor with shape: (batch_size, ..., '
               'input_dim). The most common situation would be a '
               '2D input with shape (batch_size, input_dim).',
        'range': None
    },
    'default': None,
    'required': False,
    'len_range': None
}

DISTRIBUTE = {
    'name': 'distribute',
    'type': {
        'key': 'choice',
        'des': 'Distribute of the value of hyperparameters.',
        'range': [
            {
                'name': "uniform",
                'type': {
                    'key': 'range',
                    'des': 'Uniform distribute',
                    'range': None
                }

            },
            {
                'name': "choice",
                'type': {
                    'key': 'range',
                    'des': 'choice distribute',
                    'range': None
                }
            }
        ]
    }
}

# tips: no default value
CONSTANT = {
    "MNIST_CONF": {
        "layers": [
            {
                "name": "Dense",
                "args": {
                    "units": 512,
                    "input_shape": [784, ],
                    "activation": "relu"
                }
            },
            {
                "name": "Dropout",
                "args": {
                    "rate": {
                        "distribute": "uniform",
                        "value": "0, 0.2"
                    }
                }
            },
            {
                "name": "Dense",
                "args": {
                    "units": {
                        "distribute": "choice",
                        "value": [256, 512, 1024]
                    },
                    "activation": "relu"
                }
            },
            {
                "name": "Dropout",
                "args": {
                    "rate": {
                        "distribute": "uniform",
                        "value": "0, 1"
                    }
                }
            },
            {
                "name": "Dense",
                "args": {
                    "units": 10,
                    "activation": "softmax"
                }
            }
        ],
        "compile": {
            "loss": "categorical_crossentropy",
            "optimizer": {
                "name": "RMSprop",
                "args": {
                    "lr": 0.001
                }
            },
            "metrics": ["accuracy"]
        },
        "fit": {
            "args": {
                "epochs": {
                    "distribute": "choice",
                    "value": [1]
                },
                "batch_size": {
                    "distribute": "choice",
                    "value": [64, 128]
                }
            }
        },
        "evaluate": {
            "args": {
                "batch_size": {
                    "distribute": "choice",
                    "value": [64]
                }
            }
        }

    },
    # test conf template for backend use
    "TEST_CONF": {
        "layers": [
            {
                "name": "Dense",
                "args": {
                    "units": {
                        "distribute": "choice",
                        "value": [256, 512]
                    },
                    "activation": {
                        "distribute": "choice",
                        "value": ["relu"]
                    },
                    "input_shape": [20],
                    "init": "uniform"
                }
            },
            {
                "name": "Dropout",
                "args": {
                    "rate": {
                        "distribute": "uniform",
                        "value": '0, 1',
                    }
                }
            }
        ],
        "compile": {
            "loss": {
                "distribute": "choice",
                "value": ["categorical_crossentropy"]
            },
            "optimizer": {
                "name": "SGD",
                "args": {
                    "lr": {
                        "distribute": "choice",
                        "value": [0.01]
                    },
                    "momentum": {
                        "distribute": "choice",
                        "value": [0]
                    }
                }
            },
            "metrics": ["accuracy"]
        },
        "fit": {
            "args": {
                "epochs": {
                    "distribute": "choice",
                    "value": [20]
                },
                "batch_size": {
                    "distribute": "choice",
                    "value": [128]
                }
            }
        },
        "evaluate": {
            "args": {
                "batch_size": {
                    "distribute": "choice",
                    "value": [128]
                }
            }
        }
    },

    # TODO spark models json for frontend use
    "SPARK_MODELS": {
        "layers": [
            {
                "name": "Dense",
                "args": [
                    {
                        "name": "units",
                        "type": DISTRIBUTE,
                        "default": 32,
                        "required": True
                    },
                    ACTIVATION,
                    INPUT_SHAPE
                ],
            }
        ]

    }
}


if __name__ == "__main__":
    train_hyperas_model()
