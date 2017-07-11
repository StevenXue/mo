#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-06-09 14:00pm
# @function : Getting all of the Model of Machine Learning
# @running  : python
# Further to FIXME of None
"""

# import pandas as pd
# import numpy as np
# from sklearn.cluster import KMeans
# from minepy import MINE

from bson import ObjectId

# from lib import model_orig
from server3.entity.model import Model
from server3.repository.model_repo import ModelRepo
from server3.business import user_business, ownership_business

model_repo = ModelRepo(Model)


def get_by_model_name(model_name):
    # model_obj = Model(name=model_name)
    # return model_repo.read_by_model_name(model_obj)
    return model_repo.read_by_unique_field('name', model_name)


def get_by_model_id(model_obj):
    return model_repo.read_by_id(model_obj)


def add(name, description, category,
        target_py_code, entry_function,
        to_code_function, parameter_spec, input):
    model = Model(name=name, description=description, category=category,
                  entry_function=entry_function, target_py_code=target_py_code,
                  to_code_function=to_code_function,
                  parameter_spec=parameter_spec,
                  input=input)
    # user = user_business.get_by_user_ID('system')
    # ownership_business.add(user, False, model=model)
    return model_repo.create(model)


def remove(model_obj):
    model_repo.delete_by_id(model_obj.id)


def update_one_public_model():
    """
        数据库建一个model的collection, 记载public的数据分析工具包简介
    """
    user = user_business.get_by_user_ID('system')

    MNIST = Model(name='MNIST手写识别',
                  description='MNIST手写识别',
                  usage=0,
                  classification=0,
                  target_py_code="/lib/aaa/xxx",
                  input_data={
                      'shape': {
                          'DO': 550000,
                          'D1': 28,
                          'D2': 28
                      },
                      'ranks': 3,
                      'type': 'DT_FLOAT',
                      'target_input_addr': '/lib/xxx/aaa'
                  },
                  cnn_level=1,
                  evaluate_matrix=[0, 1],
                  optimization_algorithm=[0])
    MNIST = model_repo.create(MNIST)
    ownership_business.add(user, False, model=MNIST)


if __name__ == '__main__':
    pass
