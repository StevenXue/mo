#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Zhaofeng Li
# @version  : 1.0
# @date     : 2018-05-08
# @function : Getting all of the job of statics analysis
# @running  : python
# Further to FIXME of None
"""
from copy import deepcopy

from datetime import datetime

from server3.entity.job import Job
from server3.entity.job import Log
from server3.entity.job import RunningModule
from server3.repository.job_repo import JobRepo
from server3.business.general_business import GeneralBusiness


class JobBusiness(GeneralBusiness):
    repo = JobRepo(Job)
    entity = Job

    @classmethod
    def create_job(cls, project, type, user, source_file_path, run_args=None,
                   running_module=None, module_version=None, running_code=None):
        project_dict = {
            type: project
        }
        if running_module:
            running_module = RunningModule(module=running_module, version=module_version)
        new_job = Job(user=user, source_file_path=source_file_path, run_args=run_args,
                      running_module=running_module, running_code=running_code,
                      status='running', create_time=datetime.utcnow(), updated_time=datetime.utcnow(),
                      **project_dict)
        return cls.create(new_job)

    @classmethod
    def update_log(cls, job_id, log_type, message):
        job = cls.get_by_id(job_id)
        job.logs.append(Log(log_type=log_type, message=message, timestamp=datetime.now()))
        job.updated_time = datetime.utcnow()
        if log_type == 'stderr':
            job.status = 'error'
        job.save()
        return job

    @classmethod
    def update_job_status(cls, job_id, status):
        job = cls.get_by_id(job_id)
        job.status = status
        job.save()
        return job

    @classmethod
    def get_by_project(cls, project_type, project):
        project_dict = {
            project_type: project
        }
        return cls.read(project_dict)
