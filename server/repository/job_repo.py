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
from repository.general_repo import Repo


class JobRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    # 我觉得可以用这种写法少写代码，以后有新加 field，也会方便很多
    # 我已经把这个方法写到 general_repo 里去了，之后可以直接调用
    # FIXME by zhaofeng to tianyi
    # def read_by_unique_field(self, field_name, field_value):
    #     return Repo.read_unique_one(self, {field_name: field_value})

    def read_by_job_id(self, job_obj):
        return Repo.read_unique_one(self, {'id': job_obj.id})

    def read_by_model(self, job_obj):
        return Repo.read_unique_one(self, {'model': job_obj.model})

    def read_by_toolkit(self, job_obj):
        return Repo.read_unique_one(self, {'toolkit': job_obj.toolkit})

    def read_by_staging_data_set(self, job_obj):
        return Repo.read_unique_one(self, {'staging_data_set': job_obj.staging_data_set})

    def read_by_status(self, job_obj):
        return Repo.read_unique_one(self, {'status': job_obj.status})

    def read_by_result(self, result_obj):
        print 'result_obj', result_obj.id
        return Repo.read_unique_one(self, {'id': result_obj.id})
