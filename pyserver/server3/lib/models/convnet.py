# -*- coding: UTF-8 -*-
# https://keras.io/getting-started/sequential-model-guide/#examples
# VGG-like convnet
from keras.callbacks import LambdaCallback
from keras.layers import Dense, Dropout, Conv2D, MaxPooling2D, Flatten
# from keras.models import Sequential
from keras.optimizers import SGD

from server3.lib import Sequential
from server3.lib import graph
from server3.service import logger_service
from server3.service.keras_callbacks import MongoModelCheckpoint


def convnet(conf, input, **kw):
    result_sds = kw.pop('result_sds', None)
    project_id = kw.pop('project_id', None)
    f = conf['fit']
    e = conf['evaluate']
    x_train = input['x_tr']
    y_train = input['y_tr']
    x_val = input['x_te']
    y_val = input['y_te']
    x_test = input['x_te']
    y_test = input['y_te']
    input_shape = x_train.shape[1:]
    output_units = y_train.shape[-1]

    with graph.as_default():
        model = Sequential()
        model.add(Conv2D(32, (3, 3), activation='relu', input_shape=input_shape))
        model.add(Conv2D(32, (3, 3), activation='relu'))
        model.add(MaxPooling2D(pool_size=(2, 2)))
        model.add(Dropout(0.25))

        model.add(Conv2D(64, (3, 3), activation='relu'))
        model.add(Conv2D(64, (3, 3), activation='relu'))
        model.add(MaxPooling2D(pool_size=(2, 2)))
        model.add(Dropout(0.25))

        model.add(Flatten())
        model.add(Dense(256, activation='relu'))
        model.add(Dropout(0.5))
        model.add(Dense(output_units, activation='softmax'))

        sgd = SGD(lr=0.01, decay=1e-6, momentum=0.9, nesterov=True)

        model.compile(loss='categorical_crossentropy',
                      optimizer=sgd,
                      metrics=['accuracy'])

        # callback to save metrics
        batch_print_callback = LambdaCallback(on_epoch_end=
                                              lambda epoch, logs:
                                              logger_service.log_epoch_end(epoch, logs,
                                                                   result_sds,
                                                                    project_id))

        # checkpoint to save best weight
        best_checkpoint = MongoModelCheckpoint(result_sds=result_sds, verbose=0,
                                               save_best_only=True)
        # checkpoint to save latest weight
        general_checkpoint = MongoModelCheckpoint(result_sds=result_sds,
                                                  verbose=0)

        # training
        history = model.fit(x_train, y_train,
                            validation_data=(x_val, y_val),
                            callbacks=[batch_print_callback, best_checkpoint,
                                       general_checkpoint],
                            verbose=0,
                            **f['args'])

        score = model.evaluate(x_test, y_test, **e['args'])

        config = model.get_config()
        logger_service.log_train_end(result_sds,
                             model_config=config,
                             score=score,
                             history=history.history)

        return {'score': score, 'history': history.history}


def convnet_to_str():
    pass


CONVNET = {
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
