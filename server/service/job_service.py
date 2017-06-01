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
from bson import ObjectId
from business import toolkit_business, job_business, result_business, project_business, staging_data_set_business
from repository import job_repo


def create_toolkit_job(project_id, staging_data_set_id, toolkit_id):
    """
    help toolkit to create a job before toolkit runs,
    as well as save the job & create a result after toolkit runs
    :param name: project_id, staging_data_set_id, toolkit_id
    :return:
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kw):
            # create a job
            toolkit_obj = toolkit_business.get_by_toolkit_id(toolkit_id)
            print 'hook1'
            staging_data_set_obj = staging_data_set_business.get_by_id(staging_data_set_id)
            print 'hook2'
            job_obj = job_business.add_toolkit_job(toolkit_obj, staging_data_set_obj)
            print 'start'
            # calculate
            func_result = func(*args, **kw)
            print 'result', func_result.to_json()
            # update a job
            job_obj = job_business.end_job(job_obj)
            print '1', job_obj
            # create a result, future TODO => add description
            result_obj = result_business.add_result(func_result, job_obj, 0, "")
            print '2', result_obj
            # update a project
            project_business.add_job_and_result_to_project(result_obj, ObjectId(project_id))
            print '3'
            return result_obj
        return wrapper
    return decorator

