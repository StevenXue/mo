

from keras.layers import LSTM, Dense
import numpy as np

from keras.callbacks import LambdaCallback

from server3.lib.models.keras_callbacks import MongoModelCheckpoint
from server3.service import logger_service

from server3.lib import Sequential
from server3.lib import graph
from keras.models import Sequential
from keras.layers import Dense, Dropout


def sequence_classification_with_stateful_stacked_LSTM(conf, input, **kw):
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
    data_dim = x_train.shape[1]
    timesteps = 8
    num_classes = y_train.shape[1]

    with graph.as_default():
        model = Sequential()
        model.add(LSTM(32, return_sequences=True,stateful=True,
                       input_shape=(timesteps, data_dim)))  # returns a sequence of vectors of dimension 32
        model.add(LSTM(32, return_sequences=True,stateful=True,))  # returns
        #  a sequence of vectors of dimension 32
        model.add(LSTM(32,stateful=True,))  # return a single vector of
        # dimension 32
        model.add(Dense(10, activation='softmax'))

        model.compile(loss='categorical_crossentropy',
                      optimizer='rmsprop',
                      metrics=['accuracy'])

        # Generate dummy training data
        x_train = np.random.random((1000, timesteps, data_dim))
        y_train = np.random.random((1000, num_classes))

        # Generate dummy validation data
        x_val = np.random.random((100, timesteps, data_dim))
        y_val = np.random.random((100, num_classes))

        model.fit(x_train, y_train,
                  batch_size=64, epochs=5,
                  validation_data=(x_val, y_val))
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


Sequence_classification_with_stateful_stacked_LSTM = {
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