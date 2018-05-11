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
from server3.business.job_business import JobBusiness
from server3.business.user_business import UserBusiness
from server3.business.app_business import AppBusiness
from server3.business.module_business import ModuleBusiness
from server3.business.data_set_business import DatasetBusiness


class JobService:
    @classmethod
    def create_job(cls, project_id, type, user_ID, source_file_path,
                   run_args=None, running_module=None,
                   running_code=None):
        business_mapper = {
            'app': AppBusiness,
            'module': ModuleBusiness,
            'dataset': DatasetBusiness,
        }
        project = business_mapper[type].get_by_id(project_id)
        options = {}
        if running_module:
            [modole_user_ID, module_name,
             module_version] = running_module.split('/')
            module_identity = f'{modole_user_ID}+{module_name}'
            running_module = ModuleBusiness.get_by_identity(module_identity)
            options = {
                'running_module': running_module,
                'module_version': module_version
            }
        user = UserBusiness.get_by_user_ID(user_ID)
        new_job = JobBusiness.create_job(project=project, type=type, user=user, source_file_path=source_file_path,
                                         run_args=run_args, running_code=running_code, **options)
        # add job to project
        project.jobs.append(new_job)
        project.save()

        return new_job

    @classmethod
    def get_by_project(cls, project_type, project_id):
        business_mapper = {
            'app': AppBusiness,
            'module': ModuleBusiness,
            'dataset': DatasetBusiness,
        }
        project = business_mapper[project_type].get_by_id(project_id)
        return JobBusiness.get_by_project(project_type, project)


if __name__ == '__main__':
    pass
