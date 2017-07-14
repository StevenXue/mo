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
        input = manage_nn_input(conf, staging_data_set_id, **kwargs)
        return job_service.run_code(conf, project_id, staging_data_set_id,
                                    model, f, input)
    else:
        # custom models
        train_cursor = staging_data_business.get_by_staging_data_set_id(
            staging_data_set_id)
        df_train = staging_data_service.mongo_to_df(train_cursor)
        f = models.custom_model
        model_fn = getattr(models, model.entry_function)

        if model['category'] == 1:
            # get column spec
            label_column = "label_"
            fit = conf.get('fit', None)
            data_fields = fit.get('data_fields', [[None], [None]])
            label_target = data_fields[1][0]
            x_cols = data_fields[0]
            # filter x columns
            x_cols = list(df_train.columns.values) if not x_cols else x_cols
            df_train = df_train.filter(items=x_cols)

            if df_train[label_target].dtype == np.int_ or \
                            df_train[label_target].dtype == np.float_:
                # if column is number use it directly as label
                label_column = label_target
            else:
                # if column is string, make it categorical
                df_train[label_column] = (
                    df_train[label_target].astype('category').cat.codes)

            # 添加一列 index，格式为string，作为"example_id_column"的输入
            params = conf.get('estimator', None)['args']
            index_col = params.get('example_id_column', None)
            df_train[index_col] = df_train.index.astype(str)
            # TODO support two data set
            # df_test = staging_data_service.mongo_to_df(test_cursor)
            # df_test[LABEL_COLUMN] = (
            #    df_test["income_bracket"].apply(lambda x: ">50K" in x)).astype(int)
            # df_test['index'] = df_test.index.astype(str)

            # 将连续型和类别型特征分离开，为input做准备
            continuous_cols, categorical_cols = \
                split_categorical_and_continuous(df_train, [label_column,
                                                            index_col,
                                                            label_target])
            params["feature_columns"] = [continuous_cols, categorical_cols]
            input = {
                'train': df_train,
                # 'test': df_test,
                'categorical_cols': categorical_cols,
                'continuous_cols': continuous_cols +
                                   ([index_col] if index_col else []),
                'label_col': label_column
            }
            return job_service.run_code(conf, project_id, staging_data_set_id,
                                        model, f, model_fn, input)
        if model['category'] == 2:
            fit = conf.get('fit', None)
            x_cols = fit.get('data_fields', [])
            x_cols = list(df_train.columns.values) if not x_cols else x_cols
            df_train = df_train.filter(items=x_cols)
            continuous_cols, categorical_cols = \
                split_categorical_and_continuous(df_train, [])
            input = {
                'train': df_train,
                'continuous_cols': continuous_cols,
            }
            return job_service.run_code(conf, project_id, staging_data_set_id,
                                        model, f, model_fn, input)


def run_multiple_model(conf, project_id, staging_data_set_id, model_id,
                       **kwargs):
    """
    run model by model_id and the parameter config

    :param conf: conf of model with multiple set of parameters (hyper parameters)
    :param project_id:
    :param staging_data_set_id:
    :param model_id:
    :param kwargs:
    :return:
    """
    pass
    from server3.service.spark_service import hyper_parameters_tuning
    parameters_grid = get_parameters_grid(conf)
    result = hyper_parameters_tuning(parameters_grid)
    return result
    # print("result", result)
    # job_service.run_code(conf, project_id, staging_data_set_id, model_id,
    #                      **kwargs)
    # controller.run_code(conf, model)


# ------------------------------ temp function ------------------------------s
def get_parameters_grid(conf):
    import itertools
    import copy
    epochs = conf['fit']['args']['epochs']
    batch_size = conf['fit']['args']['batch_size']

    all_experiments = list(itertools.product(epochs, batch_size))
    parameters_grid = []
    for ex in all_experiments:
        conf_template = copy.deepcopy(conf)
        conf_template['fit']['args']['epochs'] = ex[0]
        conf_template['fit']['args']['batch_size'] = ex[1]
        parameters_grid.append(conf_template)
    # print(all_experiments)
    # for p in parameters_grid:
    #     print(p)
    return parameters_grid


# ------------------------------ temp function ------------------------------e


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
    x_fields = conf['fit']['data_fields'][0]
    y_fields = conf['fit']['data_fields'][1]
    schema = kwargs.pop('schema')
    obj = split_supervised_input(staging_data_set_id, x_fields, y_fields,
                                 schema)

    # conf['fit']['x_train'] = obj['x_tr']
    # conf['fit']['y_train'] = obj['y_tr']
    # conf['fit']['x_val'] = obj['x_te']
    # conf['fit']['y_val'] = obj['y_te']
    # conf['evaluate']['x_test'] = obj['x_te']
    # conf['evaluate']['y_test'] = obj['y_te']
    return obj


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
    print(add_model_with_ownership(
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
    ))

    print(add_model_with_ownership(
        'system',
        False,
        'sdca',
        'custom sdca model',
        1,
        '/lib/sdca',
        'sdca_model_fn',
        'custom_model_to_str',
        models.SVM,
        {'type': 'DataFrame'}
    ))

    print(add_model_with_ownership(
        'system',
        False,
        'kmean',
        'custom kmean model',
        2,
        '/lib/kmean',
        'kmeans_clustering_model_fn',
        'custom_model_to_str',
        models.Kmeans,
        {'type': 'DataFrame'}
    ))

    print(add_model_with_ownership(
        'system',
        False,
        'linear_classifier',
        'custom linear classifier model',
        1,
        '/lib/linear_classifier',
        'linear_classifier_model_fn',
        'custom_model_to_str',
        models.LinearClassifier,
        {'type': 'DataFrame'}
    ))

    print(add_model_with_ownership(
        'system',
        False,
        'linear_regression',
        'custom linear regression model',
        1,
        '/lib/linear_regression',
        'linear_regression_model_fn',
        'custom_model_to_str',
        models.LinearRegression,
        {'type': 'DataFrame'}
    ))


if __name__ == '__main__':
    pass
    conf = {
        'estimator': {
            'args': {
                "n_classes": 2,
                "weight_column_name": None,
                "gradient_clip_norm": None,
                "enable_centered_bias": False,
                "_joint_weight": False,
                "label_keys": None,
            }
        },
        'fit': {
            "data_fields": [[], ["income_bracket"]],
            "args": {
                "steps": 30
            }
        },
        'evaluate': {
            'args': {
                'steps': 1
            }
        }
    }
    run_model(conf, "595f32e4e89bde8ba70738a3", "5965cda1d123ab8f604a8dd0",
              "59687822d123abcfbfe8cabd")




    # temp()
