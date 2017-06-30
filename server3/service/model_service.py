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

from service import job_service
from business import model_business, ownership_business, user_business
from utility import json_utility
# from lib import model_code


def get_all_public_model():
    models = [obj.model.to_mongo().to_dict() for obj in ownership_business.
              list_ownership_by_type_and_private('model', False)]
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
    model = model_business.add(name, description, category,
                               target_py_code, entry_function,
                               to_code_function, parameter_spec, input)
    user = user_business.get_by_user_ID(user_ID)
    ownership_business.add(user, is_private, model=model)
    return model


def get_value(obj, key, default):
    if obj:
        if obj[key]:
            return obj[key]
        else:
            return default
    else:
        raise ValueError


def keras_seq_to_str(obj):
    """
    a general implementation of sequential model of keras
    :param obj: config obj
    :return:
    """
    #     model = Sequential()
    # Dense(64) is a fully-connected layer with 64 hidden units.
    # in the first layer, you must specify the expected input data shape:
    # here, 20-dimensional vectors.
    ls = obj['layers']
    comp = obj['compile']
    f = obj['fit']
    e = obj['evaluate']
    str_model = 'model = Sequential()\n'
    op = comp['optimizer']
    for l in ls:
        layer_name = get_value(l, 'name', 'Dense')
        layer_units = get_value(l, 'units', 0)
        if get_args(l):
            str_model += 'model.add(%s(%s, %s))' % (
                layer_name, layer_units, get_args(l)[:-2]) + '\n'
        else:
            str_model += 'model.add(%s(%s))' % (layer_name, layer_units) + '\n'

    optimizers_name = get_value(op, 'name', 'SGD')
    str_model += 'optimizers = %s(%s)' % (optimizers_name, get_args(op)[:-2]) + '\n'
    str_model += "model.compile(loss='" + \
                 get_value(comp, 'loss', 'categorical_crossentropy') + \
                 "', optimizer=optimizers, metrics= [" + get_metrics(comp) + \
                 "])\n"
    str_model += "model.fit(x_train, y_train, " + get_args(f)[:-2] + ")\n"
    str_model += "score = model.evaluate(x_test, y_test, " + get_args(e)[
                                                             :-2] + ")\n"

    print(str_model)


def get_metrics(obj):
    temp_str = ''
    for i in obj['metrics']:
        temp_args = i
        if type(temp_args) is str:
            temp_str += "'" + str(temp_args) + "',"
        else:
            temp_str += str(temp_args) + ', '

    return temp_str[:-1]


def get_args(obj):
    temp_str = ''
    for i in obj['args']:
        temp_args = get_value(obj['args'], i, 0)
        if type(temp_args) is str:
            temp_str += str(i) + "='" + str(temp_args) + "', "
        else:
            temp_str += str(i) + '=' + str(temp_args) + ', '
    return temp_str
