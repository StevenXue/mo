import os
import sys
import keras
from keras.preprocessing import image
from keras.layers import Conv2D, MaxPooling2D, GlobalAveragePooling2D
from keras.layers import Dropout, Flatten, Dense
from keras.models import Sequential
from keras.models import Model
from keras.optimizers import SGD
from sklearn.datasets import load_files
from keras.utils import np_utils
import numpy as np
from glob import glob
from PIL import ImageFile
from keras.callbacks import ModelCheckpoint
from keras.models import load_model
from io import BytesIO
from PIL import Image
import base64
import re
from keras.models import model_from_json
import json
from keras import backend as K
import tensorflow as tf

# sys.path.insert(0, os.path.abspath("../"))
sys.path.insert(0, os.path.dirname(__file__))

def path_to_tensor(img_path):
    # loads RGB image as PIL.Image.Image type
    img = image.load_img(img_path, target_size=(224, 224))
    # convert PIL.Image.Image type to 3D tensor with shape (224, 224, 3)
    x = image.img_to_array(img)
    # convert 3D tensor to 4D tensor with shape (1, 224, 224, 3) and return 4D tensor
    return np.expand_dims(x, axis=0)

def paths_to_tensor(img_paths):
    list_of_tensors = [path_to_tensor(img_path) for img_path in img_paths]
    return np.vstack(list_of_tensors)

def load_dataset(path,categorical_num):
    data = load_files(path)
    files = np.array(data['filenames'])
    targets = np_utils.to_categorical(np.array(data['target']), categorical_num)
    return files, targets

def save_to_json(file_path):
    with open(file_path, 'w') as f:
        json.dump(data, f)

def read_json(file_path):
    with open(file_path) as f:
        file_json = json.load(f)
    return file_json

class new_face_feature(object):

    def __init__(self, input={}):
        '''

        :param input:
        '''
        self.checkpoint_dir = os.path.join(os.path.dirname(__file__) , "checkpoint")
        self.model = None

    def train(self, input={}):
        '''

        :param input:
        :return:
        '''

        # 未输入训练数据路径，报错
        if not input.get('data_path'):
            raise Exception("you need to input data_path")
        # 获取训练数据的目录
        data_path_list = os.listdir(os.path.join(input.get('data_path'), "train"))
        categorical_num = len(data_path_list)

        train_files, train_targets = load_dataset(os.path.join(input.get('data_path'), "train"),categorical_num)
        valid_files, valid_targets = load_dataset(os.path.join(input.get('data_path'), "valid"),categorical_num)
        test_files, test_targets = load_dataset(os.path.join(input.get('data_path'), "test"),categorical_num)
        # print(train_files)
        train_tensors = paths_to_tensor(train_files).astype('float32')/255
        valid_tensors = paths_to_tensor(valid_files).astype('float32')/255
        test_tensors = paths_to_tensor(test_files).astype('float32')/255

        # 载入模型与参数 如果 input 不包含 此 file， 则使用module内的weight
        self.load_model(input.get('model_read_path'),input.get('weight_read_path'))
        # 根据训练数据调整模型结构
        self.model.layers.pop()
        xx = Dense(categorical_num, activation='softmax', name='new_predictions')(self.model.layers[-1].output)
        model=Model(self.model.input, [xx], name='newModel')
        model.compile(optimizer='rmsprop', loss='categorical_crossentropy', metrics=['accuracy'])
        epochs = input.get('epochs',2)

        model_save_path = input.get('model_save_path')

        json_string = model.to_json()

        weight_save_path = input.get('weight_save_path')
        print(weight_save_path)
        model.save(model_save_path)
        log_dir = input.get('log_dir')
        # K.clear_session()
        # tf.reset_default_graph()
        checkpointer = ModelCheckpoint(filepath=weight_save_path,
                                       verbose=1, save_best_only=True,save_weights_only=True)
        tbCallBack = keras.callbacks.TensorBoard(log_dir=log_dir, histogram_freq=0, write_graph=True, write_images=True)

        model.fit(train_tensors, train_targets,
                  validation_data=(valid_tensors, valid_targets),
                  epochs=epochs, batch_size=20, callbacks=[checkpointer,tbCallBack], verbose=1)

        return 1


    def predict(self, input={}):
        '''

        :param input:
        :return:
        '''

        # 载入模型
        self.load_model(input.get('model_path'),input.get('weight_path'))
        intermediate_layer_model = Model(input=self.model.input,
                                 output=self.model.get_layer('fc1').output)

        # 获取图片list，并返回特征值list
        imgs = input.get('imgs')
        results = []
        for img in imgs:
            x = image.img_to_array(img)
            # convert 3D tensor to 4D tensor with shape (1, 224, 224, 3) and return 4D tensor
            x = np.expand_dims(x, axis=0)
            result = intermediate_layer_model.predict(x)
            results.append(result)
        return results

    def load_model(self,model_path=None,weight_path=None):
        '''

        :param input:
        :return:
        '''
        if model_path and weight_path:
            # 载入app 训练好的model和weight
            model_path = model_path
            weight_path = weight_path
        else:
            # 载入module 内置的model和weight
            model_path = os.path.join(self.checkpoint_dir ,'my_model.h5')
            weight_path = os.path.join(self.checkpoint_dir ,'weights.best.from_scratch.hdf5')
        self.model= load_model(model_path)
        self.model.load_weights(weight_path, by_name=True)