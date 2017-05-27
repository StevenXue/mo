#!/usr/bin/python
# -*- coding: UTF-8 -*-
'''
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 11:00pm
# @function : Getting all of the job of statics analysis
# @running  : python
# Further to FIXME of None
'''


import functools
from business import toolkit_business, job_business, result_business, project_business
from repository import job_repo


def create_toolkit_job(name):
    """
    help toolkit to create a job before toolkit runs,
    as well as save the job & create a result after toolkit runs
    :param name:
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

