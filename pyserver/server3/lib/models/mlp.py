# -*- coding: UTF-8 -*-
from keras.callbacks import LambdaCallback
from keras.layers import Dense, Dropout
from keras.models import Sequential
from keras.optimizers import SGD

from server3.lib.models.keras_callbacks import MongoModelCheckpoint
from server3.service import logger


def mlp(conf, input, **kw):
    result_sds = kw.pop('result_sds', None)
    project_id = kw.pop('project_id', None)
    x_train = input['x_tr']
    y_train = input['y_tr']
    x_val = input['x_te']
    y_val = input['y_te']
    x_test = input['x_te']
    y_test = input['y_te']

    model = Sequential()

    # Dense(64) is a fully-connected layer with 64 hidden units.
    # in the first layer, you must specify the expected input data shape:
    # here, 20-dimensional vectors.
    model.add(Dense(64, activation='relu', input_dim=20))
    model.add(Dropout(0.5))
    model.add(Dense(64, activation='relu'))
    model.add(Dropout(0.5))
    model.add(Dense(10, activation='softmax'))

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
    checkpoint = MongoModelCheckpoint(result_sds=result_sds, verbose=0,
                                      save_best_only=True)

    history = model.fit(x_train, y_train,
                        validation_data=(x_val, y_val),
                        callbacks=[batch_print_callback, checkpoint],
                        epochs=20,
                        batch_size=128)

    score = model.evaluate(x_test, y_test, batch_size=128)

    weights = model.get_weights()
    config = model.get_config()
    logger.log_train_end(result_sds,
                         weights=[weight.tolist() for weight in weights],
                         model_config=config,
                         score=score,
                         history=history.history)

    return {'score': score, 'history': history.history}


MLP = {
    'compile': {
        'args': []
    },
    'fit': {
        "data_fields": {
            "name": "x_y_fields",
            "type": {
                "key": "transfer_box",
                "des": "data fields for x",
            },
            "default": None,
            "required": True,
            "x_data_type": None,
            "y_data_type": None,
            "x_len_range": None,
            "y_len_range": None
        },
        'args': [
            {
                "name": "step",
                "type": {
                    "key": "int",
                    "des": "steps for training",
                    "range": None
                },
                "default": 30,
                "required": True
            },
        ]
    },
    'evaluate': {
        'args': [
            {
                "name": "step",
                "type": {
                    "key": "int",
                    "des": "steps for evaluate",
                    "range": None
                },
                "default": 1,
                "required": True
            },
        ]
    }
}
