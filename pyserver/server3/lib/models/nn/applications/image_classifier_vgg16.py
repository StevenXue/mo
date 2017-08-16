# -*- coding: UTF-8 -*-
import os

from keras import applications
from keras import backend as K
from keras.callbacks import LambdaCallback
from keras.callbacks import ModelCheckpoint
from keras.layers import Dropout, Flatten, Dense
from keras.models import Model
from keras.preprocessing.image import ImageDataGenerator

from server3.lib import Sequential
from server3.lib import graph
from server3.lib.models.metrics import custom_metrcis
from server3.service import logger_service
from server3.service.keras_callbacks import MongoModelCheckpoint

# Todo: change this path in the  vgg model file
WEIGHTS_PATH_NO_TOP = ''


def image_classifier_vgg16(conf, input, **kw):
    # extract conf
    f = conf['fit']['args']
    e = conf['evaluate']['args']
    epochs = f['epochs']
    batch_size = f['batch_size']
    # extract kw
    result_sds = kw.pop('result_sds', None)
    project_id = kw.pop('project_id', None)
    result_dir = kw.pop('result_dir', None)
    # extract input
    train_data_dir = input['train_data_dir']
    validation_data_dir = input['validation_data_dir']
    nb_train_samples = input['nb_train_samples']
    nb_validation_samples = input['nb_validation_samples']

    # 通过train_data_dir下的文件夹数目得到分类数量
    l = os.listdir(train_data_dir)
    l.remove('.DS_Store')
    num_classes = len(l)
    if num_classes < 2:
        raise Exception('classes should be more than 1, put your '
                        'different classes images file into '
                        'different folder')

    # dimensions of our images.
    # use 150, 150 as default
    img_width, img_height = 150, 150

    if K.image_data_format() == 'channels_first':
        input_shape = (3, img_width, img_height)
    else:
        input_shape = (img_width, img_height, 3)

    with graph.as_default():

        # load the VGG16 network
        base_model = applications.VGG16(weights='imagenet', include_top=False,
                                   input_shape=input_shape)

        # build the top of cnn network
        top_model = Sequential()
        top_model.add(Flatten(input_shape=base_model.output_shape[1:]))
        # top_model.add(Dense(256, activation='relu'))
        top_model.add(Dropout(0.5))

        if num_classes == 2:
            top_model.add(Dense(1, activation='sigmoid'))
            model = Model(inputs=base_model.input,
                          outputs=top_model(base_model.output))

            for layer in model.layers[:-2]:
                layer.trainable = False

            model.compile(loss='binary_crossentropy',
                          optimizer='rmsprop',
                          metrics=['accuracy',
                                   custom_metrcis.matthews_correlation,
                                   custom_metrcis.precision,
                                   custom_metrcis.recall,
                                   custom_metrcis.fmeasure])
        else:
            top_model.add(Dense(num_classes, activation='softmax'))
            model = Model(inputs=base_model.input,
                          outputs=top_model(base_model.output))
            for layer in model.layers[:18]:
                layer.trainable = False
            model.compile(loss='categorical_crossentropy',
                          optimizer='rmsprop',
                          metrics=['accuracy'])



        # this is the augmentation configuration we will use for training
        train_datagen = ImageDataGenerator(
            rescale=1. / 255,
            shear_range=0.2,
            zoom_range=0.2,
            horizontal_flip=True)
        # this is the augmentation configuration we will use for testing:
        # only rescaling
        test_datagen = ImageDataGenerator(rescale=1. / 255)
        if num_classes == 2:
            class_mode = 'binary'
        else:
            class_mode = 'categorical'

        train_generator = train_datagen.flow_from_directory(
            train_data_dir,
            target_size=(img_width, img_height),
            batch_size=batch_size,
            class_mode=class_mode)
        validation_generator = test_datagen.flow_from_directory(
            validation_data_dir,
            target_size=(img_width, img_height),
            batch_size=batch_size,
            class_mode=class_mode)
        # callback to save metrics
        batch_print_callback = LambdaCallback(on_epoch_end=
                                              lambda epoch, logs:
                                              logger_service.log_epoch_end(
                                                  epoch, logs,
                                                  result_sds,
                                                  project_id),
                                              on_batch_end=
                                              lambda batch, logs:
                                              logger_service.log_batch_end(
                                                  batch, logs,
                                                  result_sds,
                                                  project_id)
                                              )

        # checkpoint to save best weight
        # best_checkpoint = MongoModelCheckpoint(result_sds=result_sds, verbose=0,
        #                                        save_best_only=True)
        best_checkpoint = ModelCheckpoint(
            result_dir + 'best.hdf5',
            save_weights_only=True,
            verbose=1, save_best_only=True)
        # checkpoint to save latest weight
        # general_checkpoint = MongoModelCheckpoint(result_sds=result_sds,
        #                                           verbose=0)
        general_checkpoint = ModelCheckpoint(
            result_dir + 'latest.hdf5',
            save_weights_only=True,
            verbose=1)

        history = model.fit_generator(
            train_generator,
            steps_per_epoch=nb_train_samples // batch_size,
            epochs=epochs,
            validation_data=validation_generator,
            validation_steps=nb_validation_samples // batch_size,
            callbacks=[batch_print_callback, best_checkpoint,
                       general_checkpoint],
        )
        # model.save_weights('first_try.h5')
        config = model.get_config()
        logger_service.log_train_end(result_sds,
                                     model_config=config,
                                     # score=score,
                                     history=history.history)

        model.save_weights(result_dir + 'final.hdf5')
        with open(result_dir + 'model.json', 'w') as f:
            f.write(model.to_json())

        return {'history': history.history}


def image_classifier_vgg16_to_str():
    pass


IMAGE_CLASSIFIER_VGG16 = {
    "fit": {
        "args": [
            {
                "name": "batch_size",
                "type": {
                    "key": "int",
                    "des": "Number of samples per gradient update",
                    "range": None
                },
                "default": 128
            },
            {
                "name": "epochs",
                "type": {
                    "key": "int",
                    "des": "Number of epochs to train the model",
                    "range": None
                },
                "default": 12
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
                "default": 128
            },
        ]
    }
}
