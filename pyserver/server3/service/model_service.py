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
import numpy as np

from server3.business import model_business, ownership_business, user_business
from server3.service import job_service
from server3.service.job_service import split_supervised_input
from server3.lib import models
from server3.service import staging_data_service
from server3.business import staging_data_business


def get_all_public_model():
    models = [obj.model.to_mongo().to_dict() for obj in
              ownership_business.list_ownership_by_type_and_private('model',
                                                                    False)]
    print('models', len(models))
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


def split_categorical_and_continuous(df, label_col, index_col):
    fields = list(df.columns.values)
    fields.remove(label_col)
    fields.remove(index_col)
    continuous_cols = [index_col]
    categorical_cols = []
    for field in fields:
        dtype = df[field].dtype
        if dtype == np.int_ or dtype == np.float_:
            continuous_cols.append(field)
        else:
            categorical_cols.append(field)
    return [continuous_cols, categorical_cols]


def run_model(conf, project_id, staging_data_set_id, model_id, **kwargs):
    """
    run model by model_id and the parameter config

    :param conf:
    :param project_id:
    :param staging_data_set_id:
    :param model_id:
    :param kwargs:
    :return:
    """
    model = model_business.get_by_model_id(model_id)
    # import model function
    f = getattr(models, model.entry_function)
    if model['category'] == 0:
        # keras nn
        conf = manage_nn_input(conf, staging_data_set_id, **kwargs)
        return job_service.run_code(conf, project_id, staging_data_set_id,
                                    model, f)
    elif model['category'] == 1:

        train_cursor = staging_data_business.get_by_staging_data_set_id(
            staging_data_set_id)
        df_train = staging_data_service.mongo_to_df(train_cursor)

        # TODO choose column to be label, or choose column to generate label
        LABEL_COLUMN = "label"
        df_train[LABEL_COLUMN] = (
            df_train["income_bracket"].apply(lambda x: ">50K" in x)).astype(int)

        # 添加一列 index，格式为string，作为"example_id_column"的输入
        INDEX_COLUMN = 'index'
        df_train[INDEX_COLUMN] = df_train.index.astype(str)

        # TODO support two data set
        # df_test = staging_data_service.mongo_to_df(test_cursor)
        # df_test[LABEL_COLUMN] = (
        #    df_test["income_bracket"].apply(lambda x: ">50K" in x)).astype(int)
        # df_test['index'] = df_test.index.astype(str)

        # 将连续型和类别型特征分离开，为input做准备
        continuous_cols, categorical_cols = \
            split_categorical_and_continuous(df_train, LABEL_COLUMN, INDEX_COLUMN)

        input = {
            'train': df_train,
            # 'test': df_test,
            'categorical_cols': categorical_cols,
            'continuous_cols': continuous_cols,
            'label_col': LABEL_COLUMN
        }

        f = models.custom_model
        model_fn = getattr(models, model.entry_function)
        return job_service.run_code(conf, project_id, staging_data_set_id,
                                    model, f, model_fn, input)


def run_multiple_model(conf, project_id, staging_data_set_id, model_id, hyper_parameters=None,
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
    conf_grid = spark_service.get_conf_grid(conf, hyper_parameters=hyper_parameters)
    # get the data
    data = manage_nn_input(conf, staging_data_set_id, **kwargs)
    result = spark_service.hyper_parameters_tuning(conf_grid, data)
    return result


def model_to_code(conf, project_id, staging_data_set_id, model_id, **kwargs):
    """
    run model by model_id and the parameter config

    :param conf:
    :param project_id:
    :param staging_data_set_id:
    :param model_id:
    :param kwargs:
    :return:
    """
    model = model_business.get_by_model_id(model_id)
    f = model.to_code_function
    head_str = None
    if model['category'] == 0:
        head_str = manage_supervised_input_to_str(conf, staging_data_set_id,
                                                  **kwargs)
    return job_service.run_code(conf, project_id, staging_data_set_id,
                                model, f, head_str)


def manage_nn_input(conf, staging_data_set_id, **kwargs):
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
    x_fields = conf['fit']['x_train']
    y_fields = conf['fit']['y_train']
    schema = kwargs.pop('schema')
    # restore data to variable str
    conf['fit']['x_train'] = 'x_train'
    conf['fit']['y_train'] = 'y_train'
    conf['fit']['x_val'] = 'x_test'
    conf['fit']['y_val'] = 'y_test'
    conf['evaluate']['x_test'] = 'x_test'
    conf['evaluate']['y_test'] = 'x_test'

    code_str = "schema = '%s'\n" % schema
    # str += 'conf = %s\n' % conf
    code_str += "staging_data_set_id = '%s'\n" % staging_data_set_id
    x_str = "x_fields = %s\n" % x_fields
    y_str = "y_fields = %s\n" % y_fields
    x_str = line_split_for_long_fields(x_str)
    y_str = line_split_for_long_fields(y_str)
    code_str += x_str
    code_str += y_str
    code_str += "from libs.service import job_service\n"
    code_str += "obj = job_service.split_supervised_input(" \
                "staging_data_set_id, x_fields, y_fields, schema)\n"
    code_str += "x_train = obj['x_tr']\n"
    code_str += "y_train = obj['y_tr']\n"
    code_str += "x_test = obj['x_te']\n"
    code_str += "y_test = obj['y_te']\n"

    return code_str


def temp():

    add_model_with_ownership(
        'system',
        False,
        'keras_seq',
        'keras_seq from keras',
        0,
        '/lib/keras_seq',
        'keras_seq',
        'keras_seq_to_str',
        models.KERAS_SEQ_SPEC,
        {'type': 'ndarray', 'n': None}
    )

    add_model_with_ownership(
        'system',
        False,
        'sdca',
        'custom sdca model',
        1,
        '/lib/sdca',
        'sdca_model_fn',
        'custom_model_to_str',
        models.SVM,
        {'type': 'ndarray', 'n': None}
    )


if __name__ == '__main__':
    pass
    conf = {
        "example_id_column": 'index',
        "feature_columns": [["age", "education_num", "capital_gain",
                             "capital_loss", "hours_per_week"], ["race"]],
        "weight_column_name": None,
        "model_dir": None,
        "l1_regularization": 0.0,
        "l2_regularization": 0.5,
        "num_loss_partitions": 1,
        "kernels": None,
        "config": None,
    }
    run_model(conf, "595f32e4e89bde8ba70738a3", "5965cda1d123ab8f604a8dd0",
              "5964f16ad123ab7df77c80ba")
    # temp()


