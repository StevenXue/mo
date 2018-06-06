# -*- coding: UTF-8 -*-
import os

from server3.service.project_service import ProjectService
from server3.business.module_business import ModuleBusiness
from server3.business.data_set_business import DatasetBusiness
from server3.constants import MODULE_DIR


class DatasetService(ProjectService):
    business = DatasetBusiness

    @classmethod
    def get_by_id(cls, project_id, **kwargs):
        project = super().get_by_id(project_id, **kwargs)
        project.versions = \
            ['.'.join(version.split('_')) for version in
             project.versions]
        return project

    @classmethod
    def publish(cls, project_id, commit_msg, version):
        try:
            dataset = cls.business.deploy_or_publish(project_id, commit_msg,
                                                     version=version)
            cls.send_message_favor(dataset, m_type='publish')
        except:
            dataset = cls.business.get_by_id(project_id)
            dataset.status = 'inactive'
            dataset.save()
            cls.send_message_favor(dataset, m_type='publish_fail')
        else:
            return dataset

    @classmethod
    def deploy(cls, project_id, commit_msg):
        try:
            dataset = cls.business.deploy_or_publish(project_id, commit_msg)
            cls.send_message_favor(dataset, m_type='deploy')
        except:
            dataset = cls.business.get_by_id(project_id)
            dataset.status = 'inactive'
            dataset.save()
            cls.send_message_favor(dataset, m_type='deploy_fail')
        else:
            return dataset


if __name__ == '__main__':
    pass
