#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-24 11:00pm
# @function : Getting all of the job of statics analysis
# @running  : python
# Further to FIXME of None
"""

from entity.result import Result
from repository.result_repo import ResultRepo
from datetime import datetime

result_repo = ResultRepo(Result)


def add_result(result, job_obj, result_type, description):
    """job_obj is a obj"""
    time = datetime.utcnow()
    result_obj = Result(result=result, create_time=time, job=job_obj, result_type=result_type, description=description)
    return result_repo.create(result_obj)


def update_result(result_id, result_obj):
    # should be dictionary
    result = get_result_by_id(result_id).result.copy()
    result.update(result_obj)
    return result_repo.add_and_update_one_by_id(result_obj.id, {'result': result})


def get_result_by_id(result_id):
    return result_repo.read_by_result_id(result_id)


def get_result_by_job(job_obj):
    return result_repo.read_by_job(job_obj)