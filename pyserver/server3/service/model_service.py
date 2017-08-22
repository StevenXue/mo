#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 11:00pm
# @function : Getting all of the model of statics analysis
# @running  : python
# Further to FIXME of None
"""
import os
import shlex
import inspect
from subprocess import call

import numpy as np
import pandas as pd
import simplejson as json

from server3.business import file_business
from server3.business import job_business
from server3.business import model_business, ownership_business, user_business
from server3.business import project_business
from server3.business import staging_data_business
from server3.lib import models
from server3.repository import config
from server3.service import job_service
from server3.service import staging_data_service
from server3.service.job_service import split_supervised_input
from server3.service.saved_model_services import encoder as keras_encoder
from server3.service.saved_model_services import keras_saved_model
from server3.service import served_model_service

user_directory = config.get_file_prop('UPLOAD_FOLDER')
# user_directory = 'user_directory/'

# TODO 根据entity生成
ModelType = {
    'neural_network': 0,
    'custom_supervised': 1,
    'unsupervised': 2,
    'half_supervised': 3,
    'folder_input': 4,
    'hyperas': 5

}


def get_all_public_model():
    models = [obj.model.to_mongo().to_dict() for obj in
              ownership_business.list_ownership_by_type_and_private('model',
                                                                    False)]
    return models


def list_public_model_name():
    all_names = []
    for tool in get_all_public_model():
        all_names.append(tool.model.name)
    return all_names


def add_model_with_ownership(user_ID, is_private, name, description, category,
                             target_py_code, entry_function,
                             to_code_function, parameter_spec, input):
    """
    add_model_with_ownership
    :param user_ID:
    :param is_private:
    :param name:
    :param description:
    :param category:
    :param target_py_code:
    :param entry_function:
    :param to_code_function:
    :param parameter_spec:
    :param input:
    :return:
    """
    model = model_business.add(name, description, category,
                               target_py_code, entry_function,
                               to_code_function, parameter_spec, input)
    user = user_business.get_by_user_ID(user_ID)
    ownership_business.add(user, is_private, model=model)
    return model


def split_categorical_and_continuous(df, exclude_cols):
    fields = list(df.columns.values)
    for col in exclude_cols:
        fields.remove(col)
    continuous_cols = []
    categorical_cols = []
    for field in fields:
        dtype = df[field].dtype
        if dtype == np.int_ or dtype == np.float_:
            continuous_cols.append(field)
        else:
            categorical_cols.append(field)
    return continuous_cols, categorical_cols


def run_model(conf, project_id, data_source_id, model_id, **kwargs):
    """
    run model by model_id and the parameter config

    :param conf:
    :param project_id:
    :param data_source_id:
    :param model_id:
    :param kwargs:
    :return:
    """
    model = model_business.get_by_model_id(model_id)
    project = project_business.get_by_id(project_id)
    ownership = ownership_business.get_ownership_by_owned_item(project,
                                                               'project')
    result_dir = '{0}{1}/{2}/'.format(user_directory,
                                      ownership.user.user_ID,
                                      project.name)
    # import model function
    if model['category'] == ModelType['neural_network']:
        # keras nn
        f = getattr(models, model.entry_function)

        input_dict = manage_nn_input(conf, data_source_id, **kwargs)
        return job_service.run_code(conf, project_id, data_source_id,
                                    model, f, input_dict,
                                    result_dir=result_dir)
    elif model['category'] == ModelType['folder_input']:
        # input from folder
        f = getattr(models, model.entry_function)
        input_dict = model_input_manager_folder_input(conf, data_source_id,
                                                      **kwargs)
        print(input_dict)
        return job_service.run_code(conf, project_id, None,
                                    model, f, input_dict,
                                    file_id=data_source_id,
                                    result_dir=result_dir)
    else:
        # custom models
        f = models.custom_model
        model_fn = getattr(models, model.entry_function)
        fit = conf.get('fit', None)
        if model['category'] == ModelType['custom_supervised']:
            data_fields = fit.get('data_fields', [[], []])
            input_dict = model_input_manager_custom_supervised(data_fields,
                                                               data_source_id,
                                                               model.name,
                                                               **kwargs)
            return job_service.run_code(conf, project_id, data_source_id,
                                        model, f, model_fn, input_dict,
                                        result_dir=result_dir)
        if model['category'] == ModelType['unsupervised']:
            x_cols = fit.get('data_fields', [])
            input_dict = model_input_manager_unsupervised(x_cols,
                                                          data_source_id,
                                                          model.name,
                                                          **kwargs)
            return job_service.run_code(conf, project_id, data_source_id,
                                        model, f, model_fn, input_dict,
                                        result_dir=result_dir)


def is_array_and_not_empty(x):
    return isinstance(x, list) and len(x) > 0


def run_multiple_model(conf, project_id, staging_data_set_id, model_id,
                       hyper_parameters=None,
                       **kwargs):
    """
    run model by model_id and the parameter config

    :param conf: conf of model with multiple set of parameters (hyper parameters)
    :param project_id:
    :param staging_data_set_id:
    :param model_id:
    :param kwargs:
    :param hyper_parameters:
    :return:
    """
    from server3.service import spark_service
    # using conf and hyper_parameters to generate conf_grid
    conf_grid = spark_service.get_conf_grid(conf,
                                            hyper_parameters=hyper_parameters)
    # get the data
    data = manage_nn_input_temp(conf, staging_data_set_id, **kwargs)
    result = spark_service.hyper_parameters_tuning(conf_grid, data)
    return result


def run_hyperas_model(conf, project_id, data_source_id, model_id, **kwargs):
    from server3.lib.models.hyperas_model import train_hyperas_model
    return train_hyperas_model(conf=conf, data_source_id=data_source_id,
                               **kwargs)


def model_to_code(conf, project_id, data_source_id, model_id, **kwargs):
    """
    run model by model_id and the parameter config

    :param conf:
    :param project_id:
    :param data_source_id:
    :param model_id:
    :param kwargs:
    :return:
    """
    model = model_business.get_by_model_id(model_id)
    f = getattr(models, model.to_code_function)

    if model['category'] == 0:
        # keras nn
        head_str = manage_supervised_input_to_str(conf, data_source_id,
                                                  **kwargs)
        return job_service.run_code(conf, project_id, data_source_id,
                                    model, f, head_str)
    elif model['category'] == ModelType['folder_input']:
        # input from folder
        head_str = manage_folder_input_to_str(conf, data_source_id,
                                              **kwargs)
        return job_service.run_code(conf, project_id, None,
                                    model, f, head_str,
                                    file_id=data_source_id)
    else:
        # custom models
        head_str = ''
        head_str += 'import logging\n'
        head_str += 'import numpy as np\n'
        head_str += 'import pandas as pd\n'
        head_str += 'import tensorflow as tf\n'
        head_str += 'from tensorflow.python.framework import constant_op\n'
        head_str += 'from tensorflow.python.framework import dtypes\n'
        head_str += 'from tensorflow.contrib.learn.python.learn import metric_spec\n'
        head_str += 'from server3.lib import models\n'
        head_str += 'from server3.lib.models.modified_tf_file.monitors import ValidationMonitor\n'
        head_str += 'from server3.business import staging_data_set_business\n'
        head_str += 'from server3.business import staging_data_business\n'
        head_str += 'from server3.service import staging_data_service\n'
        head_str += "from server3.service import job_service\n"
        head_str += 'from server3.service.model_service import ' \
                    'split_categorical_and_continuous\n'
        head_str += 'from server3.service.custom_log_handler ' \
                    'import MetricsHandler\n'
        head_str += 'model_fn = models.%s\n' % model.entry_function
        head_str += "data_source_id = '%s'\n" % data_source_id
        head_str += "model_name = '%s'\n" % model.name
        head_str += "kwargs = %s\n" % kwargs
        fit = conf.get('fit', None)
        if model['category'] == 1:
            data_fields = fit.get('data_fields', [[], []])
            head_str += 'data_fields = %s\n' % data_fields
            head_str += inspect.getsource(model_input_manager_custom_supervised)
            head_str += "input_dict = model_input_manager_custom_supervised(" \
                        "data_fields, data_source_id, model_name, **kwargs)\n"
        elif model['category'] == 2:
            x_cols = fit.get('data_fields', [])
            head_str += "x_cols = %s\n" % x_cols
            head_str += inspect.getsource(model_input_manager_unsupervised)
            head_str += "input_dict = model_input_manager_unsupervised(x_cols, " \
                        "data_source_id, model_name)\n"
        return job_service.run_code(conf, project_id, data_source_id,
                                    model, f, head_str)


def manage_nn_input(conf, staging_data_set_id, **kwargs):
    """
    deal with input when supervised learning
    :param conf:
    :param staging_data_set_id:
    :return:
    """
    x_fields = conf['fit']['data_fields'][0]
    y_fields = conf['fit']['data_fields'][1]
    schema = kwargs.pop('schema')
    obj = split_supervised_input(staging_data_set_id, x_fields, y_fields,
                                 schema, **kwargs)
    return obj


def model_input_manager_custom_supervised(data_fields, data_source_id,
                                          model_name, **kwargs):
    def is_array_and_not_empty(x):
        return isinstance(x, list) and len(x) > 0

    # to data frame
    if not is_array_and_not_empty(
            data_fields[0]) or not is_array_and_not_empty(
        data_fields[1]):
        raise ValueError('fields array empty')

    data = staging_data_business. \
        get_by_staging_data_set_and_fields(data_source_id,
                                           data_fields[0] +
                                           data_fields[1],
                                           allow_nan=False)

    data = staging_data_service.mongo_to_df(data)
    df_x = data[data_fields[0]]
    df_y = data[data_fields[1]]
    schema = kwargs.pop('schema')
    obj = staging_data_service.split_test_train({'x': df_x, 'y': df_y},
                                                schema,
                                                **kwargs)
    return {
        'model_name': model_name,
        **obj
    }


def model_input_manager_unsupervised(x_cols, data_source_id, model_name,
                                     **kwargs):
    def is_array_and_not_empty(x):
        return isinstance(x, list) and len(x) > 0

    # to data frame
    if not is_array_and_not_empty(x_cols):
        raise ValueError('field list empty')
    train_cursor = staging_data_business. \
        get_by_staging_data_set_and_fields(data_source_id,
                                           x_cols,
                                           allow_nan=False)
    df_x = staging_data_service.mongo_to_df(train_cursor)
    schema = kwargs.pop('schema')
    obj = staging_data_service.split_test_train({'x': df_x,
                                                 'y': pd.DataFrame([[]])},
                                                schema,
                                                **kwargs)
    obj.pop('y_tr')
    obj.pop('y_te')
    return {
        'model_name': model_name,
        **obj
    }


def model_input_manager_folder_input(conf, file_id, **kwargs):
    file = file_business.get_by_id(file_id)
    print(file['uri'])
    input = {
        'train_data_dir': file['uri'] + 'train/',
        'validation_data_dir': file['uri'] + 'validation/'
    }
    input['nb_train_samples'] = sum(
        [len(files) for r, d, files in
         os.walk(input['train_data_dir'])])
    input['nb_validation_samples'] = sum(
        [len(files) for r, d, files in
         os.walk(input['validation_data_dir'])])
    return input


# temp
def manage_nn_input_temp(conf, staging_data_set_id, **kwargs):
    """
    deal with input when supervised learning
    :param conf:
    :param staging_data_set_id:
    :return:
    """
    x_fields = conf['fit']['x_train']
    y_fields = conf['fit']['y_train']
    schema = kwargs.pop('schema')
    obj = split_supervised_input(staging_data_set_id, x_fields, y_fields,
                                 schema)
    conf['fit']['x_train'] = obj['x_tr']
    conf['fit']['y_train'] = obj['y_tr']
    conf['fit']['x_val'] = obj['x_te']
    conf['fit']['y_val'] = obj['y_te']
    conf['evaluate']['x_test'] = obj['x_te']
    conf['evaluate']['y_test'] = obj['y_te']
    return conf


def line_split_for_long_fields(field_str):
    field_str = field_str.split(' ')
    for i in range(len(field_str) // 10):
        field_str[i * 10 + 1] += '\n'
    return ' '.join(field_str)


def manage_supervised_input_to_str(conf, staging_data_set_id, **kwargs):
    """
    deal with input when supervised learning
    :param conf:
    :param staging_data_set_id:
    :return:
    """
    x_fields = conf['fit']['data_fields'][0]
    y_fields = conf['fit']['data_fields'][1]
    schema = kwargs.pop('schema')

    code_str = "schema = '%s'\n" % schema
    # str += 'conf = %s\n' % conf
    code_str += "staging_data_set_id = '%s'\n" % staging_data_set_id
    x_str = "x_fields = %s\n" % x_fields
    y_str = "y_fields = %s\n" % y_fields
    x_str = line_split_for_long_fields(x_str)
    y_str = line_split_for_long_fields(y_str)
    code_str += x_str
    code_str += y_str
    code_str += "kwargs = %s\n" % str(kwargs)
    code_str += "obj = job_service.split_supervised_input(" \
                "staging_data_set_id, x_fields, y_fields, schema, **kwargs)\n"
    code_str += "x_train = obj['x_tr']\n"
    code_str += "y_train = obj['y_tr']\n"
    code_str += "x_val = obj['x_te']\n"
    code_str += "y_val = obj['y_te']\n"
    code_str += "x_test = obj['x_te']\n"
    code_str += "y_test = obj['y_te']\n"

    return code_str


def manage_folder_input_to_str(conf, file_id, **kwargs):
    """
    deal with input when supervised learning
    :param conf:
    :param staging_data_set_id:
    :return:
    """
    file = file_business.get_by_id(file_id)
    input = {
        'train_data_dir': (file['uri'] + 'train/'),
        'validation_data_dir': (file['uri'] + 'validation/')
    }
    print(input)
    input['nb_train_samples'] = sum(
        [len(files) for r, d, files in
         os.walk(input['train_data_dir'])])
    input['nb_validation_samples'] = sum(
        [len(files) for r, d, files in
         os.walk(input['validation_data_dir'])])
    code_str = ''
    code_str += "train_data_dir = '%s'\n" % input['train_data_dir']
    code_str += "validation_data_dir = '%s'\n" % input['validation_data_dir']
    code_str += "nb_train_samples = %s\n" % input['nb_train_samples']
    code_str += "nb_validation_samples = %s\n" % input[
        'nb_validation_samples']

    return code_str


def get_results_dir_by_job_id(job_id, user_ID, checkpoint='final'):
    """
    get training result by job id
    :param job_id:
    :param user_ID:
    :param checkpoint:
    :return:
    """
    project = job_business.get_by_job_id(job_id).project
    project_name = project.name
    ownership = ownership_business.get_ownership_by_owned_item(project,
                                                               'project')
    if ownership.private and ownership.user.user_ID != user_ID:
        raise ValueError('Authentication failed')
    user_ID = ownership.user.user_ID
    result_dir = os.path.join(user_directory + user_ID, project_name, job_id)
    filename = '{}.hdf5'.format(checkpoint)
    return result_dir, filename


def encode_h5_for_keras_js(weights_hdf5_filepath):
    """
    encode_h5_for_keras_js
    :param weights_hdf5_filepath:
    :return:
    """
    encoder = keras_encoder.Encoder(weights_hdf5_filepath)
    encoder.serialize()
    encoder.save()


def deploy(user_ID, job_id, name, description, server, signatures,
           input_type, is_private=False):
    """
    deploy model
    :param user_ID: str
    :param job_id: str/ObjectId
    :param name: str
    :param description: str
    :param server: str
    :param signatures: dict
    :param input_type: str
    :param is_private: bool
    :return:
    """
    export_path, version = export(name, job_id, user_ID)
    # add a served model entity
    served_model = served_model_service.add(user_ID, name, description,
                                            version, server,
                                            signatures, input_type, export_path,
                                            is_private)
    tf_model_server = '/Users/zhaofengli/Documents/goldersgreen/serving/' \
                      'bazel-bin/tensorflow_serving/model_servers/' \
                      'tensorflow_model_server'
    call([
        tf_model_server,
        '--enable_batching',
        '--port=9000',
        '--model_name={name}'.format(name=name),
        '--model_base_path={export_path}'.format(export_path=export_path)
    ])
    return served_model


def export(name, job_id, user_ID):
    """
    export model for tf serving
    :param name: str
    :param job_id: str/ObjectId
    :return:
    """
    result_dir, h5_filename = get_results_dir_by_job_id(job_id, user_ID)
    model_dir = os.path.join(result_dir, 'model.json')
    weights_dir = os.path.join(result_dir, h5_filename)
    with open(model_dir, 'r') as f:
        data = json.load(f)
        json_string = json.dumps(data)
        model = keras_saved_model.model_from_json(json_string)
        model.load_weights(weights_dir)
        working_dir = '/tmp'
        export_base_path = os.path.join(working_dir, name)
        version = keras_saved_model.export(model, working_dir,
                                           export_base_path)
        return export_base_path, version


# ------------------------------ temp function ------------------------------e


def temp():
    pass
    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'General Neural Network',
    #     'keras_seq from keras',
    #     ModelType['neural_network'],
    #     '/lib/models/keras_seq',
    #     'keras_seq',
    #     'keras_seq_to_str',
    #     models.KERAS_SEQ_SPEC,
    #     {'type': 'ndarray', 'n': None}
    # ))
    #
    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'SVM',
    #     'custom sdca model',
    #     ModelType['custom_supervised'],
    #     '/lib/models/svm',
    #     'svm_model_fn',
    #     'custom_model_to_str',
    #     models.SVM,
    #     {'type': 'DataFrame'}
    # ))
    #
    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'Multilayer Perceptron',
    #     'Multilayer Perceptron (MLP) for multi-class softmax classification',
    #     ModelType['neural_network'],
    #     '/lib/models/mlp',
    #     'mlp',
    #     'mlp_to_str',
    #     models.MLP,
    #     {'type': 'ndarray', 'n': None}
    # ))
    #
    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'Image Classifier',
    #     'Training a small convnet from scratch: 80% accuracy in 40 lines '
    #     'of code',
    #     ModelType['folder_input'],
    #     '/lib/models/image_classifier',
    #     'image_classifier',
    #     'image_classifier_to_str',
    #     models.IMAGE_CLASSIFIER,
    #     {'type': 'folder'}
    # ))
    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'Linear Regressor',
    #     'Custom linear regression model',
    #     ModelType['custom_supervised'],
    #     'server3/lib/models/linear_regressor.py',
    #     'linear_regressor_model_fn',
    #     'custom_model_to_str',
    #     models.LinearRegressor,
    #     {'type': 'DataFrame'}
    # ))

    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'Linear Classifier',
    #     'Custom linear classifier model',
    #     ModelType['custom_supervised'],
    #     'server3/lib/models/linear_classifier.py',
    #     'linear_classifier_model_fn',
    #     'custom_model_to_str',
    #     models.LinearClassifier,
    #     {'type': 'DataFrame'}
    # ))

    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'Kmeans Clustering',
    #     'custom kmean model',
    #     ModelType['unsupervised'],
    #     'server3/lib/models/kmeans_cluster.py',
    #     'kmeans_cluster_model_fn',
    #     'custom_model_to_str',
    #     models.KmeansCluster,
    #     {'type': 'DataFrame'}
    # ))
    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'Image Classifier VGG16',
    #     'Image Classifier VGG16',
    #     ModelType['folder_input'],
    #     'server3/lib/models/nn/image_classifier_vgg16.py',
    #     'image_classifier_vgg16',
    #     'image_classifier_vgg16_to_str',
    #     models.IMAGE_CLASSIFIER_VGG16,
    #     {
    #         'type': 'DataFrame'}
    # ))
    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'Image Classifier VGG19',
    #     'Image Classifier VGG19',
    #     ModelType['folder_input'],
    #     'server3/lib/models/nn/image_classifier_vgg19.py',
    #     'image_classifier_vgg19',
    #     'image_classifier_vgg19_to_str',
    #     models.IMAGE_CLASSIFIER_VGG19,
    #     {
    #         'type': 'DataFrame'}
    # ))

    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'Image Classifier ResNet50',
    #     'Image Classifier ResNet50',
    #     ModelType['folder_input'],
    #     'server3/lib/models/nn/image_classifier_resnet50.py',
    #     'image_classifier_resnet50',
    #     'image_classifier_resnet50_to_str',
    #     models.IMAGE_CLASSIFIER_RESNET50,
    #     {
    #         'type': 'DataFrame'}
    # ))
    #
    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'Image Classifier Inception V3',
    #     'Image Classifier Inception V3',
    #     ModelType['folder_input'],
    #     'server3/lib/models/nn/image_classifier_inception_v3.py',
    #     'image_classifier_inception_v3',
    #     'image_classifier_inception_v3_to_str',
    #     models.IMAGE_CLASSIFIER_INCEPTION_V3,
    #     {
    #         'type': 'DataFrame'}
    # ))
    #
    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'Image Classifier Xception',
    #     'Image Classifier Xception',
    #     ModelType['folder_input'],
    #     'server3/lib/models/nn/image_classifier_xception.py',
    #     'image_classifier_xception',
    #     'image_classifier_xception_to_str',
    #     models.IMAGE_CLASSIFIER_XCEPTION,
    #     {
    #         'type': 'DataFrame'}
    # ))
    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'Linear Regressor',
    #     'Custom linear regression model',
    #     ModelType['custom_supervised'],
    #     'server3/lib/models/linear_regressor.py',
    #     'linear_regressor_model_fn',
    #     'linear_regressor_to_str',
    #     models.LinearRegressor,
    #     {'type': 'DataFrame'}
    # ))
    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'Random Forest',
    #     'custom Random Forest model',
    #     ModelType['custom_supervised'],
    #     '/lib/models/randomforest.py',
    #     'randomforest_model_fn',
    #     'custom_model_to_str',
    #     models.RandomForest,
    #     {'type': 'DataFrame'}
    # ))
    #
    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'Logistic Regressor',
    #     'custom Logistic Regressor model',
    #     ModelType['custom_supervised'],
    #     '/lib/models/logistic_regressor.py',
    #     'logistic_regressor_model_fn',
    #     'custom_model_to_str',
    #     models.LogisticRegressor,
    #     {'type': 'DataFrame'}
    # ))
    #
    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'Gaussian Mixture Model',
    #     'custom GMM model',
    #     ModelType['unsupervised'],
    #     '/lib/models/gmm_cluster.py',
    #     'gmm_cluster_model_fn',
    #     'custom_model_to_str',
    #     models.GMMCluster,
    #     {'type': 'DataFrame'}
    # ))

    # print(add_model_with_ownership(
    #     'system',
    #     False,
    #     'Hyperas Model',
    #     'Hyperas Model for hyperparameters tuning',
    #     ModelType['hyperas'],
    #     'server3/lib/models/linear_regressor.py',
    #     'linear_regressor_model_fn',
    #     'linear_regressor_to_str',
    #     models.HYPERAS_SPEC,
    #     {'type': 'ndarray', 'n': None}
    # ))


if __name__ == '__main__':
    pass
    # import os
    # import sys
    # sys.path.append('/Users/zhaofengli/Documents/goldersgreen/goldersgreen/pyserver/')
    # conf = {
    #     'estimator':{
    #         'args': {
    #             "example_id_column": 'index',
    #             "weight_column_name": None,
    #             "model_dir": None,
    #             "l1_regularization": 0.0,
    #             "l2_regularization": 0.5,
    #             "num_loss_partitions": 1,
    #         }
    #     },
    #     'fit': {
    #         'data_fields': [['MV', 'NOX'], ['CRIM']],
    #         "args": {
    #             "batch_size": 16,
    #             "epochs": 50
    #         }
    #     },
    #     'evaluate': {
    #         'args': {
    #             'batch_size': 16
    #         }
    #     }
    # }
    # run_model(conf, "595f32e4e89bde8ba70738a3", "5979da380c11f32674eb2788",
    #           "59687821d123abcfbfe8cab9")

    # temp()
