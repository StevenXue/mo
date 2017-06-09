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


from service import job_service
from business import toolkit_business, ownership_business, user_business, job_business, result_business, project_business
from utility import json_utility
# from lib import toolkit_code


def get_all_public_toolkit():
    list = []
    for obj in ownership_business.list_ownership_by_type_and_private('toolkit', False):
        list.append(obj.toolkit.to_mongo().to_dict())
    return list


# def toolkit_calculate(id, *argv):
#     name = toolkit_business.get_by_toolkit_id(id).name
#     return toolkit_code.dict_of_toolkit[name](*argv)


# for database 调用toolkit code tag for zhaofeng
def toolkit_calculate_temp(project_id, staging_data_set_id, toolkit_id, *argv):
    toolkit_obj = toolkit_business.get_by_toolkit_id(toolkit_id)

    # old code with old-fashioned decorator
    # prefix = "@job_service.create_toolkit_job(\"%s\")\n" % toolkit_id
    # code = toolkit_obj.target_py_code
    # string = prefix + code + '\nresult = %s(*argv)' % toolkit_obj.entry_function
    # exec string

    # new code, use new decorator
    code = toolkit_obj.target_py_code
    exec code
    func = locals()[toolkit_obj.entry_function]
    func = job_service.create_toolkit_job(project_id, staging_data_set_id, toolkit_id)(func)
    result = func(*argv)

    return result


def convert_json_and_calculate(project_id, staging_data_set_id, toolkit_id, data, k):
    """convert json list"""
    col = data[0].keys()
    # argv = [[json_utility.convert_string_to_number(obj[i]) for i in col] for obj in data]
    # # 删掉所有的np.nan, to FIXME 要给出index
    # # arg_filter = [[arr for arr in argv if np.nan not in arr]]
    index_nan = []
    arg_filter = []
    for arr in data:
        arr_temp = [json_utility.convert_string_to_number(arr[i]) for i in col]
        if np.nan not in arr_temp:
            arg_filter.append(arr_temp)
        else:
            index_nan.append(data.index(arr))
    # argv = [arg_filter]

    # 临时救急，转文字为数字
    argv_b = zip(*arg_filter)
    argv_a = []
    for arr in argv_b:
        try:
            float(arr[0])
            argv_a.append(arr)
        except ValueError:
            hash_obj = {}
            i = 1.0
            temp = []
            for item in arr:
                if item in hash_obj:
                    temp.append(hash_obj[item])
                else:
                    hash_obj[item] = i
                    i += 1
                    temp.append(hash_obj[item])
            argv_a.append(temp)
    argv = [zip(*argv_a)]

    # 正常
    if k:
        argv.append(index_nan)
        argv.append(k)
    # result = toolkit_calculate(toolkit_id, *argv)
    result = toolkit_calculate_temp(project_id, staging_data_set_id, toolkit_id, *argv)
    # project_business.add_job_and_result_to_project(result, ObjectId(project_id))
    return result.to_mongo().to_dict()


def add_toolkit_with_ownership(name, description, target_py_code,
                               entry_function, parameter_spec, user_ID,
                               is_private):
    toolkit = toolkit_business.add(name, description, target_py_code,
                                   entry_function, parameter_spec)
    user = user_business.get_by_user_ID(user_ID)
    ownership_business.add(user, is_private, toolkit=toolkit)
