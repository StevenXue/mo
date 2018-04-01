# -*- coding: UTF-8 -*-
import requests
import json

from server3.service.project_service import ProjectService
from server3.business.module_business import ModuleBusiness
from server3.business.app_business import AppBusiness
from server3.business.user_business import UserBusiness
from server3.business.statistics_business import StatisticsBusiness


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
        domin = "http://192.168.31.23:8080/function/"
        url = domin + url
        payload = json.dumps(input_json)
        headers = {
            'content-type': "application/json",
        }
        response = requests.request("POST", url, data=payload, headers=headers)
        output_json = response.json()
        # 成功调用后 在新的collection存一笔
        user_obj = UserBusiness.get_by_user_ID(user_ID=user_ID)
        # 筛选 input_json

        StatisticsBusiness.use_app(
            user_obj=user_obj, app_obj=app,
            # input_json=input_json,
            output_json=output_json)
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
