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


def get_all_public_toolkit():
    list_toolkit = []
    for obj in ownership_business.list_ownership_by_type_and_private('toolkit', False):
        list_toolkit.append(obj.toolkit.to_mongo().to_dict())
    return list_toolkit


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
                      fields, *argv, **kwargs):
    if hasattr(toolkit_orig, toolkit_obj.entry_function):
        func = getattr(toolkit_orig, toolkit_obj.entry_function)
    else:
        func = getattr(preprocess_orig, toolkit_obj.entry_function)

    func = job_service.create_toolkit_job(project_id, staging_data_set_id,
                                          toolkit_obj, fields)(func)
    result = func(*argv, **kwargs)

    return result


def convert_json_and_calculate(project_id, staging_data_set_id, toolkit_id,
                               fields, data, args):
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

    # 正式的文字转数字
    argv_before = list(zip(*arg_filter))
    argv_after = []
    for arr in argv_before:
        try:
            float(arr[0])
            argv_after.append(arr)
        except ValueError:
            argv_after.append(pd.Series(arr).astype('category').cat.codes)

    # 准备input
    argv = [list(zip(*argv_after[:len(col1)]))]
    if col2 is not None:
        argv.append(argv_after[len(col1):][0])

    toolkit_obj = toolkit_business.get_by_toolkit_id(toolkit_id)
    if toolkit_obj.category != 4:
        argv.append(index_nan)

    # toolkit_temp应该支持数据库接入
    if args:
        result = toolkit_calculate(project_id, staging_data_set_id, toolkit_obj, fields, *argv, **args)
    else:
        result = toolkit_calculate(project_id, staging_data_set_id, toolkit_obj, fields, *argv)
    # return result.to_mongo().to_dict()
    return result


def add_toolkit_with_ownership(name, description, target_py_code,
                               entry_function, parameter_spec, user_ID,
                               is_private):
    toolkit = toolkit_business.add(name, description, target_py_code,
                                   entry_function, parameter_spec)
    user = user_business.get_by_user_ID(user_ID)
    ownership_business.add(user, is_private, toolkit=toolkit)
