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
from entity.toolkit import Toolkit
from repository.job_repo import JobRepo
from business import result_business
from datetime import datetime


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


def add_toolkit_job(toolkit_obj, staging_data_set_obj, *argv):
    """toolkit is a obj"""
    # job = job_obj['staging_data_set'] or job_obj['model'] or job_obj['toolkit']
    # if not 0 < len(toolkit_obj.items()) <= 1:
    #     raise ValueError('invalid toolkit_obj')
    time = datetime.utcnow()

    job_obj = Job(status=0, toolkit=toolkit_obj, staging_data_set=staging_data_set_obj,
                  create_time=time, fields=argv if argv else None)
    return job_repo.create(job_obj)


def add_model_train_job(model_obj, staging_data_set_obj):
    time = datetime.utcnow()
    job_obj = Job(status=0, toolkit=model_obj, staging_data_set=staging_data_set_obj, create_time=time)
    return job_repo.create(job_obj)


def end_job(job_obj):
    time = datetime.utcnow()
    return job_repo.update_one_by_id(job_obj.id, {'status': 200, 'updated_time': time})


def update_job(job_obj):
    time = datetime.utcnow()
    return job_repo.update_one_by_id(job_obj.id, {'status': 100, 'updated_time': time})


def get_job_by_result(result_obj):
    return result_business.get_result_by_id(result_obj).job


def remove_by_id(file_id):
    return job_repo.delete_by_id(file_id)
