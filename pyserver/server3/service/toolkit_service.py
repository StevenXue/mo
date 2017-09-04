#!/usr/bin/python
# -*- coding: UTF-8 -*-
'''
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 11:00pm
# @function : Getting all of the toolkit of statics analysis
# @running  : python
# Further to FIXME of None
'''
import functools
from bson import ObjectId
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from minepy import MINE
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE

from server3.lib import toolkit_orig
from server3.lib import preprocess_orig
from server3.service import job_service
from server3.business import toolkit_business, ownership_business, user_business, job_business, result_business, project_business
from server3.utility import data_utility

TOOLKIT_CATEGORY_DICT = {
    0: '聚类',
    1: '特征选取',
    2: '数值转换',
    3: '降维',
    4: '概率统计推断'
}


def get_all_public_toolkit():
    list_toolkit = []
    for obj in ownership_business.list_ownership_by_type_and_private('toolkit', False):
        list_toolkit.append(obj.toolkit.to_mongo().to_dict())
    return list_toolkit


def get_all_public_toolkit_by_category():
    toolkit_category_dict = {}
    for obj in ownership_business.list_ownership_by_type_and_private('toolkit', False):
        string = TOOLKIT_CATEGORY_DICT[obj.toolkit.category]
        toolkit_obj = obj.toolkit.to_mongo()
        toolkit_obj.pop("target_py_code")
        if string in toolkit_category_dict:
            toolkit_category_dict[string].append(toolkit_obj)
        else:
            toolkit_category_dict[string] = [toolkit_obj]
    return toolkit_category_dict


def list_public_toolkit_name():
    all_names = []
    for tool in get_all_public_toolkit():
        all_names.append(tool.toolkit.name)
    return all_names


def toolkit_calculate_temp(project_id, staging_data_set_id, toolkit_id, fields, *argv):
    toolkit_obj = toolkit_business.get_by_toolkit_id(toolkit_id)
    entry_function = toolkit_obj.entry_function
    code = "from lib.toolkit_orig import " + entry_function
    exec(code)
    func = locals()[toolkit_obj.entry_function]
    func = job_service.create_toolkit_job(project_id, staging_data_set_id, toolkit_id, fields)(func)
    result = func(*argv)
    return result


# for database 调用toolkit code tag for zhaofeng
def toolkit_calculate(project_id, staging_data_set_id, toolkit_obj,
                      fields, nan_index, *argv, **kwargs):
    if hasattr(toolkit_orig, toolkit_obj.entry_function):
        func = getattr(toolkit_orig, toolkit_obj.entry_function)
    else:
        func = getattr(preprocess_orig, toolkit_obj.entry_function)

    func = job_service.create_toolkit_job(project_id, staging_data_set_id,
                                          toolkit_obj, fields, nan_index)(func)
    result = func(*argv, **kwargs)

    return result


def convert_json_and_calculate(project_id, staging_data_set_id, toolkit_id,
                               fields, data, kwargs):
    """convert json list"""
    col1, col2 = fields
    columns = col1 + col2 if col2 is not None else col1
    # 去除NaN
    index_nan = []
    arg_filter = []
    for index, item in enumerate(data):
        temp = [data_utility.convert_string_to_number_with_poss(item[i]) for i in columns]
        if np.nan not in temp:
            arg_filter.append(temp)
        else:
            index_nan.append(index)

    argv_after = list(zip(*arg_filter))

    # 准备input
    argv = [list(zip(*argv_after[:len(col1)]))]
    if col2 is not None:
        argv.append(argv_after[len(col1):][0])

    toolkit_obj = toolkit_business.get_by_toolkit_id(toolkit_id)

    # toolkit_temp应该支持数据库接入
    if kwargs:
        result = toolkit_calculate(project_id, staging_data_set_id, toolkit_obj, fields, index_nan, *argv, **kwargs)
    else:
        result = toolkit_calculate(project_id, staging_data_set_id, toolkit_obj, fields, index_nan, *argv)
    return result


def add_toolkit_with_ownership(name, description, target_py_code,
                               entry_function, parameter_spec, user_ID,
                               is_private):
    toolkit = toolkit_business.add(name, description, target_py_code,
                                   entry_function, parameter_spec)
    user = user_business.get_by_user_ID(user_ID)
    ownership_business.add(user, is_private, toolkit=toolkit)
