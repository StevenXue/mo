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
    result_obj = Result(result=result, time=time, job=job_obj)
    return result_repo.create(result_obj)
