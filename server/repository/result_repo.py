#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-24 11:00pm
# @function : Getting all of the result of statics analysis
# @running  : python
# Further to FIXME of None
"""
from repository.general_repo import Repo


class ResultRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def read_by_result_id(self, result_obj):
        return Repo.read_unique_one(self, {'id': result_obj.id})

    def read_by_job(self, job_obj):
        return Repo.read_unique_one(self, {'id': job_obj.id})
