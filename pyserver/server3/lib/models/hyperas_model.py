# -*- coding: UTF-8 -*-
"""
use hyperas to tune hyperparameters of NN models

Author: Bingwei Chen
Date: 2017.07.28

1. define JSON give to frontend to generate UI
2. JSON template got from frontend(ok)
3. transfer JSON to hyperas model string (ok)
4. transfer string model code

cause:
1. data function use import global_variable to achieve get data
2. function principle, from big function to small

1. optimizer can not support distribute
"""
import inspect
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


def train_hyperas_model(conf, data_source_id, **kwargs):
    # generate my_temp_model python file
    # conf1 = CONSTANT["MNIST_CONF"]
    conf_to_python_file(conf, data_source_id, **kwargs)

    # from my_temp_model import model_function, my_data_function_template
    my_temp_model = __import__("my_temp_model")
    # import my_temp_model
    model_function = getattr(my_temp_model, "model_function")
    my_data_function_template = \
        getattr(my_temp_model, "my_data_function_template")

    model = model_function
    data = my_data_function_template
    X_train, Y_train, X_test, Y_test = data()

    best_run, best_model = optim.minimize(model=model,
                                          data=data,
                                          algo=tpe.suggest,
                                          max_evals=5,
                                          trials=Trials())

    temp_file = "./my_temp_model.py"
    import os
    try:
        pass
        os.remove(temp_file)
        os.remove(temp_file + 'c')
    except OSError:
        pass

    print("Evalutation of best performing model:")
    score, acc = best_model.evaluate(X_test, Y_test)
    print("best score and acc", score, acc)
    return {
        "score": score,
        "acc": acc
    }


def conf_to_python_file(conf, data_source_id, **kwargs):
    """conf to python file

    :param conf:
    :return:
    """
    import_str = conf_to_import_str(conf)
    # model function: function name
    function_name = 'def model_function(x_train, y_train, x_test, y_test):\n'
    model_str = conf_to_model_str(conf)
    model_str = get_indent(model_str)
    model_function_str = function_name + model_str
    # data function
    data_function_str = conf_to_data_function_str(conf, data_source_id,
                                                  **kwargs)

    temp_file = './my_temp_model.py'
    write_temp_files(import_str + data_function_str + model_function_str,
                     temp_file)
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
    comp = conf["compile"]["args"]

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
    evaluate_str = "score, acc = model.evaluate(x_test, y_test, %s)\n" % args_to_str(
        evaluate["args"])
    model_str += evaluate_str

    # return value
    return_str = "return {'loss': -acc, 'status': STATUS_OK, 'model': model}\n\n"
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

    sometimes is string like "SGD"

    :param obj: obj of the function
    :return:
    """
    if type(obj) is str:
        function_str = '%s()' % obj
        return function_str

    name = obj["name"]
    args = obj["args"]
    args_str = args_to_str(args)
    if (type(name) is dict) and "distribute" in name:
        # {{choice([SGD(),SGD()])}}
        function_in_str = ''
        for v in name["value"]:
            part_str = '%s(%s), ' % (v, args_str)
            function_in_str += part_str
        function_str = '{{%s([%s])}}' % (
            name["distribute"], function_in_str[:-2])
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
        arg_str = '%s={{%s(%s)}}, ' % (
            key, value["distribute"], str(value["value"]))
    else:
        # normal value: input_shape="uniform"
        if type(value) is str:
            arg_str = str(key) + "='" + str(value) + "', "
        else:
            arg_str = str(key) + '=' + str(value) + ', '
    return arg_str


# data function need be generate
def my_data_function_template():
    conf = {}
    data_source_id = {}
    kwargs = {}

    from server3.service.model_service import manage_nn_input
    input = manage_nn_input(conf, data_source_id, **kwargs)
    x_train = input["x_tr"]
    y_train = input["y_tr"]
    x_test = input["x_te"]
    y_test = input["y_te"]
    return x_train, y_train, x_test, y_test


def conf_to_data_function_str(conf, data_source_id, **kwarg):
    data_function_str = inspect.getsource(my_data_function_template)
    conf_str = "conf = %s" % str(conf)
    data_source_id_str = "data_source_id = '%s'" % data_source_id
    kwarg_str = "kwargs = %s" % str({**kwarg})
    data_function_str = data_function_str.replace("conf = {}", conf_str)
    data_function_str = data_function_str.replace("data_source_id = {}",
                                                  data_source_id_str)
    data_function_str = data_function_str.replace("kwargs = {}", kwarg_str)
    return data_function_str + "\n\n"


# def data():
#     '''
#     Data providing function:
#
#     This function is separated from model() so that hyperopt
#     won't reload data for each evaluation run.
#     '''
#     (x_train, y_train), (x_test, y_test) = mnist.load_data()
#     x_train = x_train.reshape(60000, 784)
#     x_test = x_test.reshape(10000, 784)
#     x_train = x_train.astype('float32')
#     x_test = x_test.astype('float32')
#     x_train /= 255
#     x_test /= 255
#     nb_classes = 10
#     y_train = np_utils.to_categorical(y_train, nb_classes)
#     y_test = np_utils.to_categorical(y_test, nb_classes)
#
#     return x_train, y_train, x_test, y_test


def write_temp_files(tmp_str, path='./temp_model111.py'):
    """ write python string to temp file

    :param tmp_str:
    :param path:
    :return:
    """
    with open(path, 'w') as f:
        f.write(tmp_str)
        f.close()
    return


SELECT_CHIOCE = {
    'name': "choice",
    'des': "Choice distribution, "
           "Returns one of the options, which should be a list or tuple.",
    'default': ["../default"],
    "eg": "../type[range]"
}

DISTRIBUTE = {
    "name": "distribute_choice",
    "type": {
        'key': 'choice',
        'des': 'distribute choice for hyperparameters tuning',
        'range': [
            {
                'name': "uniform",
                'type': {
                    'key': 'join_low_high',
                    'des': 'Uniform distribution, Returns a value uniformly between low and high.',
                },
                'default': "0, 1",
                'eg': "0, 1"
            },
            {
                'name': "choice",
                'type': {
                    'key': 'multiple',
                    'des': "Choice distribution, "
                           "Returns one of the options, which should be a list or tuple.",
                },
                'default': None,
                "eg": [256, 512, 1024]
            }
        ]
    },
}

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

    "distribute": {
        'name': "activation_distribute",
        'type': {
            'key': 'choice_m',
            'des': "Choice distribution, "
                   "Returns one of the options, which should be a list or tuple.",
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
        'default': ["linear"],
        "eg": ['sigmoid', 'hard_sigmoid', 'linear']
    }
}

LEARNING_RATE = {
    "name": "lr",
    "type": {
        "key": "float",
        "des": "the learning rate of NN optimizers"
    },
    "distribute": DISTRIBUTE
}

MOMENTUM = {
    "name": "momentum",
    "type": {
        "key": "float",
        "des": "the learning rate of NN optimizers"
    },
    "distribute": DISTRIBUTE
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

HYPERAS_SPEC = {
    "layers": [
        {
            "name": "Dense",
            "args": [
                {
                    "name": "units",
                    "type": {
                        "key": "int",
                        "des": "Just your regular densely-connected NN layer",
                        "range": None
                    },
                    "default": 32,
                    "required": True,

                    "distribute": DISTRIBUTE
                },
                ACTIVATION,
                INPUT_SHAPE
            ],
        },
        {
            "name": "Dropout",
            "args": [
                {
                    "name": "rate",
                    "type": {
                        "key": "float",
                        "des": "Fraction of the input units to drop",
                        "range": [0, 1]
                    },
                    "default": None,
                    "required": True,
                    "distribute": DISTRIBUTE
                },
                {
                    "name": "noise_shape",
                    "type": {
                        "key": "int_m",
                        "des": "1D integer tensor representing the shape of "
                               "the binary dropout mask that will be "
                               "multiplied with the input.",
                        "range": None
                    },
                    "default": None,
                    "required": False,
                    "len_range": [3, 3]
                },
                {
                    "name": "seed",
                    "type": {
                        "key": "int",
                        "des": "A Python integer to use as random seed",
                        "range": None
                    },
                    "default": None,
                    "required": False,
                },
            ],
        },
        {
            "name": "Flatten",
            "args": [],
        },
        {
            "name": "Reshape",
            "args": [
                {
                    "name": "target_shape",
                    "type": {
                        "key": "int_m",
                        "des": "nD tensor with shape: (batch_size, ..., "
                               "input_dim). The most common situation would be "
                               "a 2D input with shape (batch_size, input_dim).",
                        "range": None
                    },
                    "default": None,
                    "required": True,
                    "len_range": None
                },
                INPUT_SHAPE
            ],
        },
        {
            "name": "Conv1D",
            "args": [
                {
                    "name": "filters",
                    "type": {
                        "key": "int",
                        "des": "the dimensionality of the output space (i.e. "
                               "the number output of filters in the "
                               "convolution)",
                        "range": None
                    },
                    "default": None,
                    "required": True,
                },
                {
                    "name": "kernel_size",
                    "type": {
                        "key": "int",
                        "des": "An integer specifying the length of the 1D "
                               "convolution window.",
                        "range": None
                    },
                    "default": None,
                    "required": True,
                },
                ACTIVATION,
                INPUT_SHAPE
            ],
        },
        {
            "name": "Conv2D",
            "args": [
                {
                    "name": "filters",
                    "type": {
                        "key": "int",
                        "des": "the dimensionality of the output space (i.e. "
                               "the number output of filters in the "
                               "convolution)",
                        "range": None
                    },
                    "default": None,
                    "required": True,
                },
                {
                    "name": "kernel_size",
                    "type": {
                        "key": "int_m",
                        "des": "An tuple/list of 2 integers, specifying the "
                               "strides of the convolution along the width and "
                               "height.",
                        "range": None
                    },
                    "default": None,
                    "required": True,
                    "len_range": [2, 2]
                },
                ACTIVATION,
                INPUT_SHAPE
            ],
        },
        {
            "name": "MaxPooling2D",
            "args": [
                {
                    "name": "pool_size",
                    "type": {
                        "key": "int_m",
                        "des": "tuple of 2 integers, factors by which to "
                               "downscale (vertical, horizontal). (2, 2) will "
                               "halve the input in both spatial dimension. ",
                        "range": None
                    },
                    "default": None,
                    "required": False,
                    "len_range": [2, 2]
                },
                {
                    "name": "strides",
                    "type": {
                        "key": "int_m",
                        "des": "tuple of 2 integers, or None. Strides values."
                               " If None, it will default to pool_size",
                        "range": None
                    },
                    "default": None,
                    "required": False,
                    "len_range": [2, 2]
                },
                {
                    "name": "padding",
                    "type": {
                        "key": "choice",
                        "des": "",
                        "range": ["valid", "same"]
                    },
                    "default": "valid",
                    "required": False,
                },
                {
                    "name": "data_format",
                    "type": {
                        "key": "choice",
                        "des": "The ordering of the dimensions in the inputs",
                        "range": ["channels_last", "channels_first"]
                    },
                    "default": "channels_last",
                    "required": False,
                },
                {
                    "name": "input_shape",
                    "type": {
                        "key": "int_m",
                        "des": "4D tensor",
                        "range": None
                    },
                    "default": None,
                    "required": False,
                    "len_range": [4, 4]
                }
            ],
        },
    ],
    "compile": {
        'args': [
            {
                "name": "loss",
                "type": {
                    "key": "choice",
                    "des": "A loss function (or objective function, or "
                           "optimization score function) is one of the two "
                           "parameters required to compile a model",
                    "range": ["mean_squared_error",
                              "mean_absolute_error",
                              "mean_absolute_percentage_error",
                              "mean_squared_logarithmic_error",
                              "squared_hinge",
                              "hinge",
                              "categorical_hinge",
                              "logcosh",
                              "categorical_crossentropy",
                              "sparse_categorical_crossentropy",
                              "binary_crossentropy",
                              "kullback_leibler_divergence",
                              "poisson",
                              "cosine_proximity"]
                },
                "default": "categorical_crossentropy",
                "required": True,

                "distribute": {
                    'name': "loss_distribute",
                    'type': {
                        'key': 'choice_m',
                        'des': "Choice distribution, "
                               "Returns one of the options, which should be a list or tuple.",
                        'range': ["mean_squared_error",
                                  "mean_absolute_error",
                                  "mean_absolute_percentage_error",
                                  "mean_squared_logarithmic_error",
                                  "squared_hinge",
                                  "hinge",
                                  "categorical_hinge",
                                  "logcosh",
                                  "categorical_crossentropy",
                                  "sparse_categorical_crossentropy",
                                  "binary_crossentropy",
                                  "kullback_leibler_divergence",
                                  "poisson",
                                  "cosine_proximity"]
                    },
                    'default': ["categorical_crossentropy"],
                    "eg": ["mean_squared_error",
                           "mean_absolute_error",
                           "mean_absolute_percentage_error"]
                }

            },
            {
                "name": "optimizer",
                "type": {
                    "key": "choice_child",
                    "des": "An optimizer is one of the two arguments required for "
                           "compiling a Keras model",
                    "range": [
                        {
                            "name": "SGD",
                            "args": [
                                LEARNING_RATE,
                                MOMENTUM
                            ]
                        },
                        {
                            "name": "Rmsprop",
                            "args": [
                                LEARNING_RATE,
                            ]
                        },
                        "adagrad",
                        "adadelta",
                        "adam",
                        "adamax",
                        "nadam"]
                },
                "default": "SGD",
                "required": True,
            },
            {
                "name": "metrics",
                "type": {
                    "key": "choices",
                    "des": "A metric is a function that is used to judge the "
                           "performance of your model",
                    "range": ["acc",
                              "mse",
                              "mae",
                              "mape",
                              "msle",
                              "cosine"]
                },
                "default": [],
                "required": False
            },
        ],
    },
    "fit": {
        "data_fields": {
            "name": "training_fields",
            "type": {
                "key": "transfer_box",
                "des": "data fields for x and y",
            },
            "default": None,
            "required": True,
            "x_data_type": ['integer', 'float'],
            "y_data_type": ['integer', 'float'],
            "x_len_range": None,
            "y_len_range": None
        },
        "args": [
            {
                "name": "batch_size",
                "type": {
                    "key": "int",
                    "des": "Number of samples per gradient update",
                    "range": None
                },
                "default": 32
            },
            {
                "name": "epochs",
                "type": {
                    "key": "int",
                    "des": "Number of epochs to train the model",
                    "range": None
                },
                "default": 10
            },
        ],
    },
    "evaluate": {
        "args": [
            {
                "name": "batch_size",
                "type": {
                    "key": "int",
                    "des": "Number of samples per gradient update",
                    "range": None
                },
                "default": 32
            },
        ]
    }
}

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
            "args": {
                "loss": "categorical_crossentropy",
                "optimizer": {
                    "name": "RMSprop",
                    "args": {
                        "lr": 0.001
                    }
                },
                "metrics": ["accuracy"]
            }
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
}

if __name__ == "__main__":
    test = {
        "conf":{
            "layers":[
                {
                    "name":"Dense",
                    "args":{
                        "units":{
                            "distribute":"uniform",
                            "value":"0, 1"
                        },
                        "activation": {
                            "distribute": "choice",
                            "value": ["relu"]
                        },
                        "input_shape": [
                            3
                        ]

                    },
                    "index":0
                },
                {
                    "name":"Dropout",
                    "args":{
                        "rate":{
                            "distribute":"choice",
                            "value":[0.1, 0.2, 0.4]
                        }
                    },
                    "index":1
                },
                {
                    "name":"Dense",
                    "args":{
                        "units":64,
                        "activation":"softmax"
                    },
                    "index":2
                }
            ],
            "compile":{
                "args":{
                    "loss":[
                        "categorical_crossentropy",
                        "hinge"
                    ],
                    "optimizer":{
                        "hyped":True,
                        "name":"SGD",
                        "range":[
                            {
                                "distribute":{
                                    "name":"distribute_choice",
                                    "type":{
                                        "des":"distribute choice for hyperparameters tuning",
                                        "key":"choice",
                                        "range":[
                                            {
                                                "default":"0, 1",
                                                "eg":"0, 1",
                                                "name":"uniform",
                                                "type":{
                                                    "des":"Uniform distribution, Returns a value uniformly between low and high.",
                                                    "key":"join_low_high"
                                                }
                                            },
                                            {
                                                "default":None,
                                                "eg":[
                                                    256,
                                                    512,
                                                    1024
                                                ],
                                                "name":"choice",
                                                "type":{
                                                    "des":"Choice distribution, Returns one of the options, which should be a list or tuple.",
                                                    "key":"multiple"
                                                }
                                            }
                                        ]
                                    }
                                },
                                "name":"lr",
                                "type":{
                                    "des":"the learning rate of NN optimizers",
                                    "key":"float"
                                }
                            },
                            {
                                "distribute":{
                                    "name":"distribute_choice",
                                    "type":{
                                        "des":"distribute choice for hyperparameters tuning",
                                        "key":"choice",
                                        "range":[
                                            {
                                                "default":"0, 1",
                                                "eg":"0, 1",
                                                "name":"uniform",
                                                "type":{
                                                    "des":"Uniform distribution, Returns a value uniformly between low and high.",
                                                    "key":"join_low_high"
                                                }
                                            },
                                            {
                                                "default":None,
                                                "eg":[
                                                    256,
                                                    512,
                                                    1024
                                                ],
                                                "name":"choice",
                                                "type":{
                                                    "des":"Choice distribution, Returns one of the options, which should be a list or tuple.",
                                                    "key":"multiple"
                                                }
                                            }
                                        ]
                                    }
                                },
                                "name":"momentum",
                                "type":{
                                    "des":"the learning rate of NN optimizers",
                                    "key":"float"
                                }
                            }
                        ],
                        "args":{
                            "lr":{

                                "value":"0, 1",
                                "distribute":"uniform",
                                "uniform": 0

                            },
                            "momentum":10
                        }
                    },
                    "metrics":[
                        "acc"
                    ],
                    "hype_loss":True
                }
            },
            "fit":{
                "data_fields":[
                    [
                        "alm",
                        "erl",
                        "gvh"
                    ],
                    [
                        "mit",
                        "nuc"
                    ]
                ],
                "args":{
                    "batch_size":100,
                    "epochs":10
                }
            },
            "evaluate":{
                "args":{
                    "batch_size":100
                }
            }
        },
        "project_id":"598accd4e89bdeaf80e7206f",
        "staging_data_set_id":"598af547e89bdec0f544b427",
        "schema":"seq"
    }
    MODEL_TEMPLATE = {
        "conf": {
            "layers": [
                {
                    "name": "Dense",
                    "args": {
                        "units": 64,
                        "activation": "relu",
                        "input_shape": [
                            3
                        ]
                    }
                },
                {
                    "name": "Dropout",
                    "args": {
                        "rate": {
                            "distribute": "uniform",
                            "value": "0, 0.8"
                        }
                    }
                },
                {
                    "name": "Dense",
                    "args": {
                        "units": 64,
                        "activation": "relu"
                    }
                },
                {
                    "name": "Dropout",
                    "args": {
                        "rate": 0.5
                    }
                },
                {
                    "name": "Dense",
                    "args": {
                        "units": 2,
                        "activation": "softmax"
                    }
                }
            ],
            "compile": {

                "loss": "categorical_crossentropy",
                "optimizer": "SGD",
                "metrics": ["accuracy"]

            },
            "fit": {
                "data_fields": [["age", "capital_gain", "education_num"],
                                ["capital_loss", "hours_per_week"]],
                "args": {
                    "batch_size": 128,
                    "epochs": 20
                }
            },
            "evaluate": {
                "args": {
                    "batch_size": 128
                }
            }
        },
        "project_id": "5965e5fae89bde79f3f0e920",
        "staging_data_set_id": "5965cda1d123ab8f604a8dd0",
        "schema": "seq"
    }
    conf = test["conf"]
    data_source_id = "598af547e89bdec0f544b427"
    kwargs = {
        "schema": "seq"
    }
    train_hyperas_model(conf, data_source_id, **kwargs)


