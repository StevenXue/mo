# -*- coding: UTF-8 -*-
import os

from keras import layers
from keras.callbacks import LambdaCallback
from keras.callbacks import ModelCheckpoint

from server3.lib import Sequential
from server3.lib import graph
from server3.service import logger_service
from server3.service.keras_callbacks import MongoModelCheckpoint
from server3.service.keras_callbacks import MyModelCheckpoint
from server3.utility.str_utility import generate_args_str
from server3.service.saved_model_services import keras_saved_model
from server3.constants import SPEC


def keras_seq(conf, input, **kw):
    """
    a general implementation of sequential model of keras
    :param conf: config dict
    :return:
    """
    result_sds = kw.pop('result_sds', None)
    job_id = kw.pop('job_id', None)
    result_dir = kw.pop('result_dir', None)
    if result_sds is None:
        raise RuntimeError('no result sds id passed to model')
    if job_id is None:
        raise RuntimeError('no job id passed to model')
    with graph.as_default():
        model = Sequential()

        ls = conf['layers']
        comp = conf['compile']
        f = conf['fit']
        e = conf['evaluate']
        x_train = input['x_tr']
        y_train = input['y_tr']
        x_val = input['x_te']
        y_val = input['y_te']
        x_test = input['x_te']
        y_test = input['y_te']

        # TODO add validator
        # op = comp['optimizer']

        # loop to add layers
        for l in ls:
            # get layer class from keras
            layer_class = getattr(layers, l['name'])
            # add layer
            model.add(layer_class(**l['args']))

        # optimiser
        # sgd_class = getattr(optimizers, op['name'])
        # sgd = sgd_class(**op['args'])

        # define the metrics
        # compile
        model.compile(**comp['args'])

        # callback to save metrics
        batch_print_callback = LambdaCallback(on_epoch_begin=
                                              lambda epoch, logs:
                                              logger_service.log_epoch_begin(
                                                  epoch, logs,
                                                  result_sds,
                                                  job_id),
                                              on_epoch_end=
                                              lambda epoch, logs:
                                              logger_service.log_epoch_end(
                                                  epoch, logs,
                                                  result_sds,
                                                  job_id),
                                              on_batch_end=
                                              lambda batch, logs:
                                              logger_service.log_batch_end(
                                                  batch, logs,
                                                  result_sds,
                                                  job_id)
                                              )

        # checkpoint to save best weight
        best_checkpoint = MyModelCheckpoint(
            ['/pyserver/best.hdf5',
             os.path.abspath(os.path.join(result_dir, 'best.hdf5'))],
            save_weights_only=True,
            verbose=1, save_best_only=True)
        # checkpoint to save latest weight
        general_checkpoint = MyModelCheckpoint(
            ['/pyserver/latest.hdf5', os.path.abspath(os.path.join(result_dir,
                                                                   'latest.hdf5'))],
            save_weights_only=True,
            verbose=1)

        # training
        history = model.fit(x_train, y_train,
                            validation_data=(x_val, y_val),
                            callbacks=[batch_print_callback, best_checkpoint,
                                       general_checkpoint],
                            verbose=0,
                            **f['args'])

        # testing
        score = model.evaluate(x_test, y_test, **e['args'])
        # weights = model.get_weights()
        config = model.get_config()
        logger_service.log_train_end(result_sds,
                                     model_config=config,
                                     score=score,
                                     history=history.history)
        keras_saved_model.save_model(result_dir, model)
        return {'score': score, 'history': history.history}


def keras_seq_to_str(obj, head_str, **kw):
    """
    a general implementation of sequential model of keras
    :param obj: config obj
    :param head_str: config obj
    :return:
    """
    #     model = Sequential()
    # Dense(64) is a fully-connected layer with 64 hidden units.
    # in the first layer, you must specify the expected input data shape:
    # here, 20-dimensional vectors.
    result_sds = kw.pop('result_sds', None)
    job_id = kw.pop('job_id', None)
    if result_sds is None:
        raise RuntimeError('no result_sds created')

    ls = obj['layers']
    comp = obj['compile']
    f = obj['fit']
    e = obj['evaluate']
    layer_names = set([l['name'] for l in ls])
    layer_import = ''
    for n in layer_names:
        layer_import += 'from keras.layers import %s\n' % n
    str_model = 'from keras.models import Sequential\n'
    str_model += 'from keras.callbacks import LambdaCallback\n'
    str_model += 'from server3.lib.models.keras_callbacks import ' \
                 'MongoModelCheckpoint\n'
    str_model += 'from server3.service import logger_service\n'
    str_model += 'from server3.service import job_service\n'
    str_model += 'from server3.service import model_service\n'
    str_model += 'from server3.business import staging_data_set_business\n'
    str_model += layer_import
    str_model += head_str
    str_model += 'model = Sequential()\n'
    # op = comp['optimizer']
    for l in ls:
        layer_name = get_value(l, 'name', 'Dense')
        # layer_units = get_value(l, 'units', 0)
        if get_args(l):
            str_model += 'model.add(%s(%s))' % (
                layer_name, get_args(l)[:-2]) + '\n'
        else:
            str_model += 'model.add(%s())' % layer_name + '\n'

    # compile
    comp_str = generate_args_str(comp['args'])
    str_model += "model.compile(%s)\n" % comp_str

    str_model += "result_sds = staging_data_set_business.get_by_id('%s')\n" % \
                 result_sds['id']
    str_model += "job_id = '%s'\n" % job_id
    # callback
    str_model += "batch_print_callback = LambdaCallback(on_epoch_end=lambda " \
                 "epoch, \\\nlogs: logger_service.log_epoch_end(epoch, " \
                 "logs, result_sds, job_id))\n"
    str_model += "best_checkpoint = MongoModelCheckpoint(" \
                 "result_sds=result_sds, verbose=0, save_best_only=True)\n"
    str_model += "general_checkpoint = MongoModelCheckpoint(" \
                 "result_sds=result_sds, verbose=0)\n"
    # fit
    str_model += "model.fit(x_train, y_train,  validation_data=(x_test, " \
                 "y_test), \\\ncallbacks=[batch_print_callback, " \
                 "best_checkpoint, general_checkpoint], " + \
                 get_args(f)[:-2] + ")\n"
    str_model += "score = model.evaluate(x_test, y_test, " + get_args(e)[
                                                             :-2] + ")\n"
    return str_model


def get_metrics(obj):
    temp_str = ''
    for i in obj['metrics']:
        temp_args = i
        if type(temp_args) is str:
            temp_str += "'" + str(temp_args) + "',"
        else:
            temp_str += str(temp_args) + ', '

    return temp_str[:-1]


def get_args(obj):
    temp_str = ''
    for i in obj['args']:
        temp_args = get_value(obj['args'], i, 0)
        if type(temp_args) is str:
            temp_str += str(i) + "='" + str(temp_args) + "', "
        else:
            temp_str += str(i) + '=' + str(temp_args) + ', '
    return temp_str


def get_value(obj, key, default):
    if obj:
        if obj[key]:
            return obj[key]
        else:
            return default
    else:
        raise ValueError


_ACTIVATION = {
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
    'required': True
}

ACTIVATION = {
    **SPEC.ui_spec['choice'],
    'name': 'activation',
    'display_name': 'Activation',
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
              'linear'],
    'default': 'relu',
    'required': True
}

_INPUT_SHAPE = {
    'name': 'input_shape',
    'type': {
        'key': 'int_m',
        'des': 'nD tensor with shape: (batch_size, ..., '
               'input_dim). The most common situation would be a '
               '2D input with shape (batch_size, input_dim).',
        'range': None
    },
    'default': None,
    'required': True,
    'len_range': None
}

INPUT_SHAPE = {
    **SPEC.ui_spec['multiple_input'],
    'name': 'input_shape',
    'display_name': 'Input Shape',
    'des': 'nD tensor with shape: (batch_size, ..., '
           'input_dim). The most common situation would be a '
           '2D input with shape (batch_size, input_dim).',
    'required': True,
    'default': [],
    'len_range': [1, None]
}

# supported layers:
# Dense, Dropout, Flatten, Reshape, Conv1D, Conv2D, MaxPooling2D
# wait for support:
# Embedding, LSTM, GlobalAveragePooling1D
KERAS_SEQ_STEPS = [
    {
        "name": "data_source",
        "display_name": "Select Data Source",
        "args": [
            {
                "name": "input",
                "des": "Please select input data source",
                "type": "select_box",
                "default": None,
                "required": True,
                "len_range": [
                    1,
                    1
                ],
                "values": []
            }
        ]
    },
    {
        "name": "feature_fields",
        "display_name": "Select Feature Fields",
        "args": [
            {
                "name": "fields",
                "des": "",
                "required": True,
                "type": "multiple_choice",
                "len_range": [
                    1,
                    None
                ],
                "values": []
            }
        ]
    },
    {
        "name": "label_fields",
        "display_name": "Select Label Fields",
        "args": [
            {
                "name": "fields",
                "des": "",
                "type": "multiple_choice",
                "required": True,
                "len_range": [
                    1,
                    None
                ],
                "values": []
            }
        ]
    },
    {
        "name": "layers",
        "display_name": "Build your network",
        "args": [
            {
                "name": "layers",
                "des": "",
                "range": [
                    {
                        "name": "Dense",
                        "args": [
                            {
                                **SPEC.ui_spec['input'],
                                "name": "units",
                                "display_name": "Units",
                                "des": "Just your regular densely-connected NN layer",
                                "default": 32,
                                "required": True
                            },
                            ACTIVATION,
                            INPUT_SHAPE
                        ],
                    },
                    {
                        "name": "Dropout",
                        "args": [
                            {
                                **SPEC.ui_spec['input'],
                                "name": "rate",
                                "display_name": "Rate",
                                "des": "Fraction of the input units to drop",
                                "type": "float",
                                "range": [0, 1],
                                "required": True
                            },
                            {
                                **SPEC.ui_spec['multiple_input'],
                                "name": "noise_shape",
                                "display_name": "Noise Shape",
                                "des": "1D integer tensor representing the shape of "
                                       "the binary dropout mask that will be "
                                       "multiplied with the input.",
                                "len_range": [3, 3]
                            },
                            {
                                **SPEC.ui_spec['input'],
                                "name": "seed",
                                "display_name": "Seed",
                                "des": "A Python integer to use as random seed",
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
                                **SPEC.ui_spec['multiple_input'],
                                "name": "target_shape",
                                "display_name": "Target Shape",
                                "des": "nD tensor with shape: (batch_size, ..., "
                                       "input_dim). The most common situation would be "
                                       "a 2D input with shape (batch_size, input_dim).",
                                "required": True,
                            },
                            INPUT_SHAPE
                        ],
                    },
                    {
                        "name": "Conv1D",
                        "args": [
                            {
                                **SPEC.ui_spec['input'],
                                "name": "filters",
                                "display_name": "Filters",
                                "des": "the dimensionality of the output space (i.e. "
                                       "the number output of filters in the "
                                       "convolution)",
                                "required": True,
                            },
                            {
                                **SPEC.ui_spec['input'],
                                "name": "kernel_size",
                                "display_name": "Kernel Size",
                                "des": "An integer specifying the length of the 1D "
                                       "convolution window.",
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
                                **SPEC.ui_spec['input'],
                                "name": "filters",
                                "display_name": "Filters",
                                "des": "the dimensionality of the output space (i.e. "
                                       "the number output of filters in the "
                                       "convolution)",
                                "required": True,
                            },
                            {
                                **SPEC.ui_spec['input'],
                                "name": "kernel_size",
                                "display_name": "Kernel Size",
                                "des": "An integer specifying the length of the 1D "
                                       "convolution window.",
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
                                **SPEC.ui_spec['multiple_input'],
                                "name": "pool_size",
                                "display_name": "Pool Size",
                                "des": "tuple of 2 integers, factors by which to "
                                       "downscale (vertical, horizontal). (2, 2) will "
                                       "halve the input in both spatial dimension. ",
                                "len_range": [2, 2]
                            },
                            {
                                **SPEC.ui_spec['multiple_input'],
                                "name": "strides",
                                "display_name": "Strides",
                                "des": "tuple of 2 integers, or None. Strides values."
                                       " If None, it will default to pool_size",
                                "len_range": [2, 2]
                            },
                            {
                                **SPEC.ui_spec['choice'],
                                "name": "padding",
                                "display_name": "Padding",
                                "des": "",
                                "range": ["valid", "same"],
                                "default": "valid",
                            },
                            {
                                **SPEC.ui_spec['choice'],
                                "name": "data_format",
                                "display_name": "Data Format",
                                "des": "The ordering of the dimensions in the inputs",
                                "range": ["channels_last", "channels_first"],
                                "default": "channels_last"
                            },
                            {
                                **INPUT_SHAPE,
                                "des": "4D tensor",
                                "len_range": [4, 4],
                                "required": False,
                            }
                        ],
                    },
                ],
                "values": [{}, {}],
            },
        ]
    },
    {
        "name": "compile",
        "display_name": "Compile Parameters",
        'args': [
            {
                **SPEC.ui_spec['choice'],
                "name": "loss",
                "display_name": "Loss",
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
                          "cosine_proximity"],
                "default": "categorical_crossentropy",
                "required": True
            },
            {
                **SPEC.ui_spec['choice'],
                "name": "optimizer",
                "display_name": "Optimizer",
                "des": "An optimizer is one of the two arguments required for "
                       "compiling a Keras model",
                "range": ["sgd",
                          "rmsprop",
                          "adagrad",
                          "adadelta",
                          "adam",
                          "adamax",
                          "nadam"],
                "default": "sgd",
                "required": True
            },
            {
                **SPEC.ui_spec['choice'],
                "name": "metrics",
                "Name": "Metrics",
                "des": "A metric is a function that is used to judge the "
                       "performance of your model",
                "range": ["acc",
                          "mse",
                          "mae",
                          "mape",
                          "msle",
                          "cosine"],
                "default": ["acc"],
            },
        ],
    },
    {
        "name": "fit",
        "display_name": "Fit Parameters",
        "args": [
            {
                **SPEC.ui_spec['input'],
                "name": "batch_size",
                "display_name": "Batch Size",
                "des": "Number of samples per gradient update for model "
                       "training",
                "default": 32,
                "required": True
            },
            {
                **SPEC.ui_spec['input'],
                "name": "epochs",
                "display_name": "Epochs",
                "des": "Number of epochs of model training",
                "default": 10,
                "required": True
            },
        ],
    },
    {
        "name": "evaluate",
        "display_name": "Evaluate Parameters",
        "args": [
            {
                **SPEC.ui_spec['input'],
                "name": "batch_size",
                "display_name": "Batch Size",
                "des": "Number of samples per gradient update for evaluate",
                "default": 32,
                "required": True
            },
        ]
    }
]

KERAS_SEQ_SPEC = {
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
                    "required": True
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
                    "required": True
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
                "required": True
            },
            {
                "name": "optimizer",
                "type": {
                    "key": "choice",
                    "des": "An optimizer is one of the two arguments required for "
                           "compiling a Keras model",
                    "range": ["sgd",
                              "rmsprop",
                              "adagrad",
                              "adadelta",
                              "adam",
                              "adamax",
                              "nadam"]
                },
                "default": "sgd",
                "required": True
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

if __name__ == '__main__':
    # import json
    # print(json.dumps(KERAS_SEQ_SPEC))
    pass
