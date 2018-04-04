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
                project)
        return project

    @classmethod
    def publish(cls, project_id):
        module = cls.business.publish(project_id)
        receivers = module.favor_users  # get app subscriber
        admin_user = user_business.get_by_user_ID('admin')
        message_service.create_message(admin_user, 'publish', receivers,
                                       module.user, module_name=module.name,
                                       module_id=module.id)
        return module


if __name__ == '__main__':
    pass
