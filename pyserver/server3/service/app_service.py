# -*- coding: UTF-8 -*-
import requests
import json
import re
from bson import ObjectId

from server3.service.project_service import ProjectService
from server3.business.module_business import ModuleBusiness
from server3.business.app_business import AppBusiness
from server3.business.user_business import UserBusiness
from server3.business.statistics_business import StatisticsBusiness
from server3.service import message_service
from server3.constants import DOCKER_IP


class AppService(ProjectService):
    business = AppBusiness

    @classmethod
    def add_used_module(cls, app_id, used_modules, func):
        used_modules = [ModuleBusiness.get_by_id(mid) for mid in used_modules]
        for module in used_modules:
            module.args = ModuleBusiness.load_module_params(
                module)
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
    def deploy(cls, app_id):
        app = cls.business.deploy(app_id)
        receivers = app.favor_users  # get app subscriber
        message_service.create_message(ObjectId('592f8775df86b2e82f9788cf'),
                                       'deploy', receivers, app.user,
                                       app_name=app.name, app_id=app.id)
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
