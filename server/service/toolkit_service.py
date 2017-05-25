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

import numpy as np
import pandas as pd
import functools
from business import toolkit_business, ownership_business, user_business, job_business, result_business
from lib import toolkit_code


def get_all_public_toolkit():
    list = []
    for obj in toolkit_business.get_all_public_toolkit():
        # list.append(obj.to_mongo().to_dict())
        # print obj.toolkit.id
        list.append(toolkit_business.get_by_toolkit_id(obj.toolkit.id).to_mongo().to_dict())
    return list


def create_toolkit_job(name):
    """
    help toolkit to create a job before toolkit runs,
    as well as save the job & create a result after toolkit runs
    :param text:
    :return:
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kw):
            # create a job
            toolkit_obj = toolkit_business.get_by_toolkit_name(name)
            job_obj = job_business.add_toolkit_job(toolkit_obj)

            # calculate
            func_result = func(*args, **kw)

            # update a job
            job_obj = job_business.end_job(job_obj)

            # create a result
            result_obj = result_business.add_result(func_result, job_obj)
            return result_obj
        return wrapper
    return decorator


def toolkit_calculate(id, *args):
    name = toolkit_business.get_by_toolkit_id(id).name
    from lib import toolkit_code
    return toolkit_code.dict_of_toolkit[name](*args).to_mongo().to_dict()
