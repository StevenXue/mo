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
def toolkit_calculate(project_id, staging_data_set_id, toolkit_id, fields, *argv):
    toolkit_obj = toolkit_business.get_by_toolkit_id(toolkit_id)

    # old code with old-fashioned decorator
    # prefix = "@job_service.create_toolkit_job(\"%s\")\n" % toolkit_id
    # code = toolkit_obj.target_py_code
    # string = prefix + code + '\nresult = %s(*argv)' % toolkit_obj.entry_function
    # exec string

    # new code, use new decorator
    # code = toolkit_obj.target_py_code
    # exec(code)
    # func = locals()[toolkit_obj.entry_function]

    func = getattr(toolkit_orig, toolkit_obj.entry_function) if hasattr(toolkit_orig, toolkit_obj.entry_function) else getattr(preprocess_orig, toolkit_obj.entry_function)
    func = job_service.create_toolkit_job(project_id, staging_data_set_id, toolkit_id, fields)(func)
    result = func(*argv)

    return result


def convert_json_and_calculate(project_id, staging_data_set_id, toolkit_id,
                               fields, data, k):
    """convert json list"""
    col = list(data[0].keys())
    # 删掉所有的np.nan, to FIXME 要给出index
    index_nan = []
    arg_filter = []
    # 以下是旧的产生index的方法
    # for arr in data:
    #     arr_temp = [data_utility.convert_string_to_number_with_poss(arr[i]) for i in col]
    #     if np.nan not in arr_temp:
    #         arg_filter.append(arr_temp)
    #     else:
    #         index_nan.append(data.index(arr))
    #         # print ("nan number")
    #         # index_nan = [i for i, x in enumerate(data) if x == arr_temp]
    for index, item in enumerate(data):
        temp = [data_utility.convert_string_to_number_with_poss(item[i]) for i in col]
        if np.nan not in temp:
            arg_filter.append(temp)
        else:
            index_nan.append(index)

    # 临时救急，转文字为数字
    # argv_b = list(zip(*arg_filter))
    # argv_a = []
    # for arr in argv_b:
    #     try:
    #         float(arr[0])
    #         argv_a.append(arr)
    #     except ValueError:
    #         hash_obj = {}
    #         i = 1.0
    #         temp = []
    #         for item in arr:
    #             if item in hash_obj:
    #                 temp.append(hash_obj[item])
    #             else:
    #                 hash_obj[item] = i
    #                 i += 1
    #                 temp.append(hash_obj[item])
    #         argv_a.append(temp)
    # argv = [list(zip(*argv_a))]

    # 正式的文字转数字
    argv_before = list(zip(*arg_filter))
    argv_after = []
    for arr in argv_before:
        try:
            float(arr[0])
            argv_after.append(arr)
        except ValueError:
            argv_after.append(pd.Series(arr).astype('category').cat.codes)
    argv = [list(zip(*argv_after))]

    # 正常
    if k:
        argv.append(index_nan)
        argv.append(k)
    # result = toolkit_calculate(toolkit_id, *argv)
    # result = toolkit_calculate_temp(project_id, staging_data_set_id, toolkit_id, fields, *argv)
    result = toolkit_calculate(project_id, staging_data_set_id, toolkit_id, fields, *argv)

    # project_business.add_job_and_result_to_project(result, ObjectId(project_id))
    return result.to_mongo().to_dict()


def add_toolkit_with_ownership(name, description, target_py_code,
                               entry_function, parameter_spec, user_ID,
                               is_private):
    toolkit = toolkit_business.add(name, description, target_py_code,
                                   entry_function, parameter_spec)
    user = user_business.get_by_user_ID(user_ID)
    ownership_business.add(user, is_private, toolkit=toolkit)
