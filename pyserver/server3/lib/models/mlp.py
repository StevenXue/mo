# -*- coding: UTF-8 -*-
from keras.callbacks import LambdaCallback
from keras.layers import Dense, Dropout
from keras.models import Sequential
from keras.optimizers import SGD

from server3.lib.models.keras_callbacks import MongoModelCheckpoint
from server3.service import logger_service


def mlp(conf, input, **kw):
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
    batch_print_callback = LambdaCallback(on_epoch_end=
                                          lambda epoch, logs:
                                          logger.log_epoch_end(epoch, logs,
                                                               result_sds,
                                                               project_id))

    # checkpoint to save best weight
    best_checkpoint = MongoModelCheckpoint(result_sds=result_sds, verbose=0,
                                           save_best_only=True)
    # checkpoint to save latest weight
    general_checkpoint = MongoModelCheckpoint(result_sds=result_sds,
                                              verbose=0)

    # training
    # TODO callback 改成异步，考虑 celery
    history = model.fit(x_train, y_train,
                        validation_data=(x_val, y_val),
                        callbacks=[batch_print_callback, best_checkpoint,
                                   general_checkpoint],
                        verbose=0,
                        **f['args'])

    score = model.evaluate(x_test, y_test, **e['args'])

    # weights = model.get_weights()
    config = model.get_config()
    logger.log_train_end(result_sds,
                         model_config=config,
                         score=score,
                         history=history.history)

    return {'score': score, 'history': history.history}


def mlp_to_str():
    pass


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
