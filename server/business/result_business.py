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


def add_result(result, job_obj):
    """job_obj is a obj"""
    time = datetime.utcnow()
    result_obj = Result(result=result, create_time=time, job=job_obj)
    return result_repo.create(result_obj)


def get_result_by_id(result_id):
    return result_repo.read_by_result_id(result_id)