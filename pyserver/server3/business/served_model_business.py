# -*- coding: UTF-8 -*-
"""
# @author   : Zhaofeng Li
# @version  : 1.0
# @date     : 2017-08-22
# @running  : python
"""

# import pandas as pd
# import numpy as np
# from sklearn.cluster import KMeans
# from minepy import MINE

from server3.entity.served_model import ServedModel
from server3.repository.served_model_repo import ServedModelRepo

served_model_repo = ServedModelRepo(ServedModel)


def get_by_id(model_obj):
    return served_model_repo.read_by_id(model_obj)


def add(name, description, version, server, signatures, input_type,
        model_base_path):
    model = ServedModel(name=name, description=description,
                        version=version, server=server,
                        signatures=signatures, input_type=input_type,
                        model_base_path=model_base_path)
    return served_model_repo.create(model)


def remove_by_id(model_id):
    return served_model_repo.delete_by_id(model_id)


if __name__ == '__main__':
    pass
