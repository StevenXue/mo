# -*- coding: UTF-8 -*-
import os

from server3.service.project_service import ProjectService
from server3.business.module_business import ModuleBusiness
from server3.business.user_business import UserBusiness
from server3.service import message_service
from server3.constants import MODULE_DIR
from server3.business.request_answer_business import RequestAnswerBusiness


class ModuleService(ProjectService):
    business = ModuleBusiness
    requestAnswerBusiness = RequestAnswerBusiness

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
        cls.send_message(module)
        return module

    @classmethod
    def deploy(cls, project_id):
        module = cls.business.deploy_or_publish(project_id)
        cls.send_message(module)
        return module

    @classmethod
    def send_message(cls, module):
        receivers = module.favor_users  # get app subscriber
        admin_user = UserBusiness.get_by_user_ID('admin')

        # 获取所有包含此module的答案
        answers_has_module = cls.requestAnswerBusiness. \
            get_by_anwser_project_id(module.id)
        # 根据答案获取对应的 request 的 owner
        for each_anser in answers_has_module:
            user_request = each_anser.user_request
            request_owener = user_request.user
            message_service.create_message(admin_user, 'publish_request',
                                           [request_owener],
                                           module.user,
                                           module_name=module.name,
                                           module_id=module.id,
                                           user_request_title=user_request.title,
                                           user_request_id=user_request.id)

        message_service.create_message(admin_user, 'publish', receivers,
                                       module.user, module_name=module.name,
                                       module_id=module.id)


if __name__ == '__main__':
    pass
