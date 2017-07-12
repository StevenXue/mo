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
from server3.repository.general_repo import Repo


class JobRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def update_one_by_id_status_and_time(self, job_id, status, updated_time):
        return Repo.update_one_by_id(self, job_id,
                                     {'status': status,
                                      'updated_time': updated_time})

