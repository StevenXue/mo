# -*- coding: UTF-8 -*-
from keras.callbacks import LambdaCallback
from keras.models import Model
from keras.layers import Input, Dense, TimeDistributed
from keras.layers import LSTM
from server3.lib.models.keras_callbacks import MongoModelCheckpoint
from server3.service import logger_service
from server3.lib import graph


def mnist_hierarchical_rnn(conf, input, **kw):
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
    x_train_shape = x_train.shape
    input_shape = x_train_shape[1:]
    num_classes = y_train.shape[1]
    # Embedding dimensions.
    row_hidden = 128
    col_hidden = 128

    with graph.as_default():
        x = Input(shape=input_shape)

        # Encodes a row of pixels using TimeDistributed Wrapper.
        encoded_rows = TimeDistributed(LSTM(row_hidden))(x)

        # Encodes columns of encoded rows.
        encoded_columns = LSTM(col_hidden)(encoded_rows)

        # Final predictions and model.
        prediction = Dense(num_classes, activation='softmax')(encoded_columns)
        model = Model(x, prediction)
        model.compile(loss='categorical_crossentropy',
                      optimizer='rmsprop',
                      metrics=['accuracy'])

        # callback to save metrics
        batch_print_callback = LambdaCallback(on_epoch_end=
                                              lambda epoch, logs:
                                              logger_service.log_epoch_end(
                                                  epoch, logs,
                                                  result_sds,
                                                  project_id))

        # checkpoint to save best weight
        best_checkpoint = MongoModelCheckpoint(result_sds=result_sds,
                                               verbose=0,
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
        # weights = model.get_weights()
        config = model.get_config()
        logger_service.log_train_end(result_sds,
                                     model_config=config,
                                     score=score,
                                     history=history.history)

        return {
            'score': score,
            'history': history.history}


def mnist_hierarchical_rnn_to_str():
    pass


MNIST_HIERARCHICAL_RNN = {
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
                "default": 5
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
