# -*- coding: UTF-8 -*-
import requests
import json
import re
from bson import ObjectId

from server3.service.project_service import ProjectService
from server3.business.module_business import ModuleBusiness
from server3.business.app_business import AppBusiness
from server3.business.user_business import UserBusiness
from server3.business import user_business
from server3.business.statistics_business import StatisticsBusiness
from server3.service import message_service
from server3.constants import DOCKER_IP
from server3.business.request_answer_business import RequestAnswerBusiness


class AppService(ProjectService):
    business = AppBusiness
    requestAnswerBusiness = RequestAnswerBusiness

    @classmethod
    def add_used_module(cls, app_id, used_modules, func, version):
        used_modules = [ModuleBusiness.get_by_id(mid) for mid in used_modules]
        for module in used_modules:
            module.args = ModuleBusiness.load_module_params(
                module, version)
        return AppBusiness.add_used_module(app_id, used_modules, func)

    @classmethod
    def run_app(cls, app_id, input_json, user_ID):
        """

        :param app_id: app id
        :type app_id: ObjectId
        :param input_json:
        :type input_json:
        :param user_ID:
        :type user_ID:
        :return:
        :rtype:
        """
        app = AppBusiness.get_by_id(project_id=app_id)
        url = app.user.user_ID + "-" + app.name
        domin = f"http://{DOCKER_IP}:8080/function/"
        url = domin + url
        payload = json.dumps(input_json)
        headers = {
            'content-type': "application/json",
        }
        response = requests.request("POST", url, data=payload, headers=headers)
        print(response.text)
        pattern = re.compile(r'STRHEAD(.+?)STREND', flags=re.DOTALL)
        results = pattern.findall(response.text)
        output_json = json.loads(results[0])
        print(output_json)
        # output_json = response.json()
        # 成功调用后 在新的collection存一笔
        user_obj = UserBusiness.get_by_user_ID(user_ID=user_ID)
        # 筛选 input_json

        StatisticsBusiness.use_app(
            user_obj=user_obj, app_obj=app,
            output_json=output_json
            # input_json=input_json,
            # output_json=output_json
        )
        return output_json

    @classmethod
    def insert_envs(cls, user_ID, app_name):
        user = UserBusiness.get_by_user_ID(user_ID)
        app = AppBusiness.read_unique_one(name=app_name, user=user)
        for module in app.used_modules:
            AppBusiness.insert_module_env(app, module)

    @classmethod
    def get_by_id(cls, project_id, **kwargs):
        project = super().get_by_id(project_id, **kwargs)
        if kwargs.get('yml') == 'true' and project.app_path:
            project.args = cls.business.load_app_params(project)
        return project

    @classmethod
    def deploy(cls, app_id, handler_file_path):
        app = cls.business.deploy(app_id, handler_file_path)
        receivers = app.favor_users  # get app subscriber
        admin_user = user_business.get_by_user_ID('admin')
        # 获取所有包含此app的答案
        answers_has_app = cls.requestAnswerBusiness.get_by_anwser_project_id(app.id)
        # 根据答案获取对应的 request 的 owner
        for each_anser in answers_has_app:
            user_request = each_anser.user_request
            request_owener = user_request.user
            message_service.create_message(admin_user, 'deploy_request',
                                           [request_owener],
                                           app.user, app_name=app.name,
                                           app_id=app.id,
                                           user_request_title=user_request.title,
                                           user_request_id=user_request.id)
        message_service.create_message(admin_user, 'deploy', receivers,
                                       app.user, app_name=app.name,
                                       app_id=app.id)


        return app

# @classmethod
# def add_used_app(cls, user_ID, app_id):
#     user = UserBusiness.get_by_user_ID(user_ID=user_ID)
#     app = cls.business.get_by_id(app_id)
#     user.used_apis.append(app)
#     user_result = user.save()
#     if user_result:
#         return {
#             "user": user_result.to_mongo(),
#         }

# def test_create_app():
#     data = {
#         "name": "预测航班延误",
#         "description": "预测航班延误信息",
#     }
#     AppService.create_project(name="预测航班延误", description="description")


if __name__ == '__main__':
    pass
