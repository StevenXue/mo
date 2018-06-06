#!/usr/bin/python
# -*- coding: UTF-8 -*-


# import pandas as pd
# import numpy as np
# from sklearn.cluster import KMeans
# from minepy import MINE

from bson import ObjectId
# from lib import model_orig
from server3.entity.model import Model
from server3.repository.model_repo import ModelRepo
from server3.business.user_business import UserBusiness
from server3.business import ownership_business
from server3.lib import models

model_repo = ModelRepo(Model)


def get_by_model_id(model_obj):
    return model_repo.read_by_id(model_obj)


def add(name, description, category,
        target_py_code, entry_function, model_type,
        to_code_function, parameter_spec, input, steps):
    model = Model(name=name, description=description, category=category,
                  entry_function=entry_function, target_py_code=target_py_code,
                  to_code_function=to_code_function, model_type=model_type,
                  parameter_spec=parameter_spec,
                  input=input, steps=steps)
    # user = UserBusiness.get_by_user_ID('system')
    # ownership_business.add(user, False, model=model)
    return model_repo.create(model)


def remove_by_id(model_id):
    return model_repo.delete_by_id(model_id)


def update_one_public_model():
    """
        数据库建一个model的collection, 记载public的数据分析工具包简介
    """
    user = UserBusiness.get_by_user_ID('system')

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


def update_by_id(model_id, **update):
    return model_repo.update_one_by_id(model_id, update)


if __name__ == '__main__':
    remove_by_id("598b3426d845c052e72ffa11")
    pass
