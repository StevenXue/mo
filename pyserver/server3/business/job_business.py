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
import re
from copy import deepcopy

from datetime import datetime

from server3.entity.job import Job
from server3.entity.job import Log
from server3.entity.job import RunningModule
from server3.repository.job_repo import JobRepo
from server3.business.general_business import GeneralBusiness
from server3.service import logger_service
from server3.business.user_business import UserBusiness
from server3.service.message_service import MessageService


class JobBusiness(GeneralBusiness):
    repo = JobRepo(Job)
    entity = Job

    @classmethod
    def create_job(cls, project, type, user, source_file_path, run_args=None,
                   running_module=None, module_version=None,
                   running_code=None):
        project_dict = {
            type: project
        }
        if running_module:
            running_module = RunningModule(module=running_module,
                                           version=module_version)
        new_job = Job(user=user, source_file_path=source_file_path,
                      run_args=run_args,
                      running_module=running_module, running_code=running_code,
                      status='running', create_time=datetime.utcnow(),
                      updated_time=datetime.utcnow(),
                      **project_dict)
        return cls.create(new_job)

    @classmethod
    def update_log(cls, job_id, log_type, message):
        job = cls.get_by_id(job_id)
        job.logs.append(
            Log(log_type=log_type, message=message, timestamp=datetime.now()))
        job.updated_time = datetime.utcnow()
        if log_type == 'exception':
            job.status = 'error'
            cls.send_message(job, m_type='job_error')
        job.save()
        return job

    @classmethod
    def update_job_status(cls, job_id, status):
        job = cls.get_by_id(job_id)
        job.status = status
        job.save()
        if status == 'success':
            cls.send_message(job, m_type='job_success')
        return job

    @classmethod
    def get_by_project(cls, project_type, project):
        project_dict = {
            project_type: project
        }
        return cls.read(project_dict)

    @classmethod
    def send_message(cls, job, m_type='job_success'):
        if job.running_code:
            job_type = 'function'
            print(job.running_code)
            job_name = re.match(r'def (\S+)\(\S*\):.*',
                                job.running_code).group(1)
        else:
            job_type = 'module'
            user_ID = job.running_module.module.user.user_ID
            module_name = job.running_module.module.name
            version = job.running_module.version
            job_name = f'{user_ID}/{module_name}/{version}'

        admin_user = UserBusiness.get_by_user_ID('admin')

        MessageService.create_message(admin_user, m_type, [job.user.id],
                                      job.user, job_name=job_name,
                                      job_id=job.id,
                                      job_type=job_type)
