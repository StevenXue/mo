# -*- coding: UTF-8 -*-
import os

from server3.service.project_service import ProjectService
from server3.business.module_business import ModuleBusiness
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


if __name__ == '__main__':
    pass
