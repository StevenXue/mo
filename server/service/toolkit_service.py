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
from business import toolkit_business, ownership_business, user_business, job_business, result_business
from lib import *


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
        def wrapper(*args, **kw):
            # create a job
            func(*args, **kw)
            # update a job
            # create a result
            #return fuction_result
        return wrapper
    return decorator


# Further FIXME to check whether toolkit name/id is input
# @create_job('toolkit_name')
# def now():
#     print '2013-12-25'

# def calculate(input_data, name):
#     @create_toolkit_job()
