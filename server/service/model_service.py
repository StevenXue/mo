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
    list_model = []
    for obj in ownership_business.list_ownership_by_type_and_private('model', False):
        list_model.append(obj.model.to_mongo().to_dict())
    return list_model


def list_public_model_name():
    all_names = []
    for tool in get_all_public_model():
        all_names.append(tool.model.name)
    return all_names


def add_model_with_ownership(user_ID, is_private, name, description, usage, classification, input_data,
                             target_py_code, cnn_level, optimization_algorithm, evaluate_matrix):
    model = model_business.add(name, description, usage, classification, input_data,
                               target_py_code, cnn_level, optimization_algorithm, evaluate_matrix)
    user = user_business.get_by_user_ID(user_ID)
    ownership_business.add(user, is_private, model=model)
