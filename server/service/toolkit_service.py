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
from bson import ObjectId


from service import job_service
from business import toolkit_business, ownership_business, user_business, job_business, result_business, project_business
from lib import toolkit_code


def get_all_public_toolkit():
    list = []
    for obj in toolkit_business.get_all_public_toolkit():
        # list.append(obj.to_mongo().to_dict())
        # print obj.toolkit.id
        list.append(obj.toolkit.to_mongo().to_dict())
    return list


def toolkit_calculate(id, *argv):
    name = toolkit_business.get_by_toolkit_id(id).name
    return toolkit_code.dict_of_toolkit[name](*argv)


# for database 调用toolkit code tag for zhaofeng
def toolkit_calculate_temp(toolkit_id, *argv):
    toolkit_obj = toolkit_business.get_by_toolkit_id(toolkit_id)
    # name = toolkit_obj.name
    prefix = "@job_service.create_toolkit_job(\"%s\")\n" % toolkit_obj.id
    code = toolkit_obj.target_py_code
    string = prefix + code + '\nresult = %s(*argv)' % toolkit_obj.entry_function
    exec string
    return result


def convert_json_and_calculate(project_id, staging_data_set_id, toolkit_id, data, k):
    """convert json list"""
    col = data[0].keys()
    argv = [[float(j[i]) for j in data] for i in col]
    if k:
        argv.append(k)
    # result = toolkit_calculate(toolkit_id, *argv)
    result = toolkit_calculate_temp(toolkit_id, *argv)
    project_business.add_job_and_result_to_project(result, ObjectId(project_id))
    return result.to_mongo().to_dict()


def add_toolkit_with_ownership(name, description, target_py_code,
                               entry_function, parameter_spec, user_ID,
                               is_private):
    toolkit = toolkit_business.add(name, description, target_py_code,
                         entry_function, parameter_spec)
    user = user_business.get_by_user_ID(user_ID)
    ownership_business.add(user, is_private, toolkit=toolkit)
