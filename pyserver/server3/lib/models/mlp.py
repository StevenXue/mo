# -*- coding: UTF-8 -*-
# https://keras.io/getting-started/sequential-model-guide/#examples
# Multilayer Perceptron (MLP) for multi-class softmax classification
import inspect
import os

from keras.callbacks import LambdaCallback
from keras.callbacks import ModelCheckpoint
from keras.layers import Dense, Dropout
from keras.optimizers import SGD

from server3.lib import Sequential
from server3.lib import graph
from server3.service import logger_service
from server3.service.keras_callbacks import MongoModelCheckpoint
from server3.service.keras_callbacks import MyModelCheckpoint
from server3.utility.str_utility import generate_args_str
from server3.service.saved_model_services import keras_saved_model
from server3.business import ownership_business
from server3.business import project_business
from server3.constants import SPEC


def mlp(conf, input, **kw):
    result_sds = kw.pop('result_sds', None)
    project_id = kw.pop('project_id', None)
    result_dir = kw.pop('result_dir', None)
    job_id = kw.pop('job_id', None)
    project = project_business.get_by_id(project_id)
    ow = ownership_business.get_ownership_by_owned_item(project, 'project')
    user_ID = ow.user.user_ID
    f = conf['fit']
    e = conf['evaluate']
    x_train = input['x_tr']
    y_train = input['y_tr']
    x_val = input['x_te']
    y_val = input['y_te']
    x_test = input['x_te']
    y_test = input['y_te']

    with graph.as_default():
        return mlp_main(result_sds, project_id, job_id, user_ID, result_dir,
                        x_train,  y_train, x_val, y_val, x_test, y_test, f, e)


def mlp_main(result_sds, project_id, job_id, user_ID, result_dir, x_train,
             y_train, x_val,  y_val, x_test, y_test, f=None, e=None):

    training_logger = logger_service.TrainingLogger(f['args']['epochs'],
                                                    project_id,
                                                    job_id,
                                                    user_ID,
                                                    result_sds)
    input_len = x_train.shape[1]
    output_len = y_train.shape[1]

    model = Sequential()

    # Dense(64) is a fully-connected layer with 64 hidden units.
    # in the first layer, you must specify the expected input data shape:
    # here, 20-dimensional vectors.
    model.add(Dense(64, activation='relu', input_dim=input_len))
    model.add(Dropout(0.5))
    model.add(Dense(64, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(output_len, activation='softmax'))

    sgd = SGD(lr=0.01, decay=1e-6, momentum=0.9, nesterov=True)

    model.compile(loss='categorical_crossentropy',
                  optimizer=sgd,
                  metrics=['accuracy'])

    # callback to save metrics
    # TODO custom to make database writing async
    batch_print_callback = LambdaCallback(on_epoch_begin=
                                          lambda epoch, logs:
                                          training_logger.log_epoch_begin(
                                              epoch, logs),
                                          on_epoch_end=
                                          lambda epoch, logs:
                                          training_logger.log_epoch_end(
                                              epoch, logs),
                                          on_batch_end=
                                          lambda batch, logs:
                                          training_logger.log_batch_end(
                                              batch, logs)
                                          )

    # checkpoint to save best weight
    best_checkpoint = MyModelCheckpoint(
        os.path.abspath(os.path.join(result_dir, 'best.hdf5')),
        save_weights_only=True,
        verbose=1, save_best_only=True)
    # checkpoint to save latest weight
    general_checkpoint = MyModelCheckpoint(
        os.path.abspath(os.path.join(result_dir, 'latest.hdf5')),
        save_weights_only=True,
        verbose=1)

    # training
    history = model.fit(x_train, y_train,
                        validation_data=(x_val, y_val),
                        callbacks=[batch_print_callback, best_checkpoint,
                                   general_checkpoint],
                        verbose=1,
                        **f['args'])

    score = model.evaluate(x_test, y_test, **e['args'])
    # weights = model.get_weights()
    config = model.get_config()
    logger_service.log_train_end(result_sds,
                                 model_config=config,
                                 score=score,
                                 history=history.history)

    keras_saved_model.save_model(result_dir, model)
    return {'score': score, 'history': history.history}


def mlp_to_str(conf, head_str, **kw):
    """
        a general implementation of sequential model of keras
        :param conf: config obj
        :param head_str: config obj
        :return:
        """
    #     model = Sequential()
    # Dense(64) is a fully-connected layer with 64 hidden units.
    # in the first layer, you must specify the expected input data shape:
    # here, 20-dimensional vectors.
    result_sds = kw.pop('result_sds', None)
    project_id = kw.pop('project_id', None)
    f = conf['fit']
    e = conf['evaluate']
    if result_sds is None:
        raise RuntimeError('no result_sds created')

    str_model = 'from keras.models import Sequential\n'
    str_model += 'from keras.callbacks import LambdaCallback\n'
    str_model += 'from server3.lib.models.keras_callbacks import ' \
                 'MongoModelCheckpoint\n'
    str_model += 'from server3.service import logger_service\n'
    str_model += 'from server3.service import job_service\n'
    str_model += 'from server3.business import staging_data_set_business\n'
    str_model += 'from keras.layers import Dense, Dropout\n'
    str_model += 'from keras.optimizers import SGD\n'
    str_model += head_str
    str_model += "result_sds = staging_data_set_business.get_by_id('%s')\n" % \
                 result_sds['id']
    str_model += "project_id = '%s'\n" % project_id
    mlp_main_str = inspect.getsource(mlp_main)
    mlp_main_str = mlp_main_str.replace("**f['args']",
                                        generate_args_str(f['args']))
    mlp_main_str = mlp_main_str.replace("**e['args']",
                                        generate_args_str(e['args']))
    str_model += mlp_main_str
    str_model += 'print(mlp_main(result_sds, project_id, x_train, y_train, ' \
                 'x_val, y_val, x_test, y_test))\n'
    print(str_model)
    return str_model


MLP_STEPS = [
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

MLP = {
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
