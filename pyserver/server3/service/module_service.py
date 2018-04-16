# -*- coding: UTF-8 -*-
import os

from server3.service.project_service import ProjectService
from server3.business.module_business import ModuleBusiness
from server3.business import user_business
from server3.service import message_service
from server3.constants import MODULE_DIR


class ModuleService(ProjectService):
    business = ModuleBusiness

    @classmethod
    def get_by_id(cls, project_id, **kwargs):
        project = super().get_by_id(project_id, **kwargs)
        if kwargs.get('yml') == 'true' and project.module_path:
            project.args = cls.business.load_module_params(
                project, kwargs.get('version'))
        project.versions = \
            ['.'.join(version.split('_')) for version in
             project.versions]
        return project

    @classmethod
    def publish(cls, project_id, version):
        module = cls.business.deploy_or_publish(project_id, version)
        cls.send_message(module, m_type='publish')
        return module

    @classmethod
    def deploy(cls, project_id):
        module = cls.business.deploy_or_publish(project_id)
        # cls.send_message(module, m_type='deploy')
        return module


if __name__ == '__main__':
    pass
