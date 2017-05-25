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
from lib import *


def create_job_and_result(text):
    """
    help toolkit to create a job before toolkit runs, 
    as well as save the job & create a result after toolkit runs
    :param text: 
    :return: 
    """
    def decorator(func):
        def wrapper(*args, **kw):
            print '%s %s():' % (text, func.__name__)
            # create a job
            func(*args, **kw)
            # update a job
            # create a result
            #return fuction_result
        return wrapper
    return decorator


# Further FIXME to check whether toolkit name/id is input
@create_job('toolkit_name')
def now():
    print '2013-12-25'