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

from entity.job import Job
from repository.job_repo import JobRepo

job_repo = JobRepo(Job)


def get_by_job_id(job_id):
    job_obj = Job(id=job_id)
    return job_repo.read_by_job_id(job_obj)


def get_by_job_model(model):
    job_obj = Job(model=model)
    return job_repo.read_by_model(job_obj)


def get_by_job_toolkit(toolkit):
    job_obj = Job(toolkit=toolkit)
    return job_repo.read_by_toolkit(job_obj)


def get_by_job_staging_data_set(staging_data_set):
    job_obj = Job(staging_data_set=staging_data_set)
    return job_repo.read_by_staging_data_set(job_obj)


def get_by_job_status(job_status):
    job_obj = Job(status=job_status)
    return job_repo.read_by_status(job_obj)


def add_toolkit_job(status=0, toolkit_obj):
    """toolkit is a obj"""
    # job = job_obj['staging_data_set'] or job_obj['model'] or job_obj['toolkit']
    if not 0 < len(toolkit_obj.items()) <= 1:
        raise ValueError('invalid toolkit_obj')
    job_obj = Job(status=0, toolkit=toolkit_obj)
    return job_repo.create(job_obj)

def end_job(job_obj):
    reutrn job_repo.update_one_by_id(job_obj, stauts = 2)