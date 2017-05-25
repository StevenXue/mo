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


def toolkit_calculate(id, *args):
    name = toolkit_business.get_by_toolkit_id(id).name
    return toolkit_code.dict_of_toolkit[name](*args).to_mongo().to_dict()
