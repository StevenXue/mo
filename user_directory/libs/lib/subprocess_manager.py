#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-06 17:00pm
# @function : Getting all of the toolkit of statics analysis
# @running  : python
# Further to FIXME of None
"""

import sys
from bson.objectid import ObjectId
from service import project_service
from server.business import model_business, staging_data_set_business, job_business, result_business, project_business
# from service import *

# 设置 'utf-8'
reload(sys)
sys.setdefaultencoding('utf-8')


def create_super_model_job(project_id, model_id, staging_data_set_id=None):
    model_obj = model_business.get_by_model_id(model_id)
    # staging_data_set_obj = staging_data_set_business.get_by_id(staging_data_set_id)
    job_obj = job_business.add_model_train_job(model_obj, staging_data_set_id)
    return job_obj


def add_training_result(project_id, job_obj, is_train=1, *args):
    """ NOTES:
    is_train = 1 => training result
    is_train = 0 => testing result
    """
    result = {}
    for arg in args:
        result[str(arg)] = arg
    # create a train_result
    if is_train:
        if job_obj.status == 0:
            result_obj = result_business.add_result(result, job_obj, 1, "")
        else:
            result_id = result_business.get_result_by_job(job_obj)
            result_obj = result_business.update_result(result_id, result)

    else:
        if job_obj.status == 0:
            result_obj = result_business.add_result(result, job_obj, 2, "")
        else:
            result_id = result_business.get_result_by_job(job_obj)
            result_obj = result_business.update_result(result_id, result)

    # update a job
    job_business.update_job(job_obj)

    # update a project
    project_service.add_job_and_result_to_project(result_obj, ObjectId(
        project_id))


def end_training_result(job_obj):
    job_business.end_job(job_obj)


if __name__ == '__main__':
    pass