# -*- coding: UTF-8 -*-
import requests
import json

from server3.service.project_service import ProjectService
from server3.business.module_business import ModuleBusiness
from server3.business.app_business import AppBusiness


class AppService(ProjectService):
    business = AppBusiness

    @classmethod
    def add_used_module(cls, app_id, used_modules, func):
        used_modules = [ModuleBusiness.get_by_id(mid) for mid in used_modules]
        for module in used_modules:
            module.args = ModuleBusiness.load_module_params(module)
        return AppBusiness.add_used_module(app_id, used_modules, func)

    @classmethod
    def run_app(cls, app_id, input_json):
        app = AppBusiness.get_by_id(project_id=app_id)
        url = app.user.user_ID+"-"+app.name
        domin = "http://192.168.31.23:8080/function/"
        url = domin+url
        payload = json.dumps(input_json)
        headers = {
            'content-type': "application/json",
        }
        response = requests.request("POST", url, data=payload, headers=headers)
        return response.json()
# def test_create_app():
#     data = {
#         "name": "预测航班延误",
#         "description": "预测航班延误信息",
#     }
#     AppService.create_project(name="预测航班延误", description="description")


# tmp_data = [{
#     # "_id": ObjectId("5a60942dd845c07dfc8b7259"),
#     "url": "/predict_flight_delay",
#     "keyword": "预测 航班 延误",
#     "description": "预测航班延误信息",
#     "http_req": "GET",
#     "input": {
#         "body": {
#             "date_time": {
#                 # "value": null,
#                 "type": "datetime"
#             },
#             "flight_no": {
#                 # "value": null,
#                 "type": "str"
#             }
#         }
#     },
#     "output": {
#
#     },
#     "status": 0.0,
#     "fake_response": "预计延迟3小时",
#     "domain": "http://192.168.31.6:5000",
#     "name": "预测航班延误",
#     "favor_users": [
#         # ObjectId("5a01c3ff0c11f3291b0e5ca9")
#     ]
# },
#     {
#         # "_id": ObjectId("5a61abeb81a4431145fffb29"),
#         "url": "/predict_weather",
#         "keyword": "预测 天气",
#         "description": "预测航班延误信息",
#         "http_req": "GET",
#         "input": {
#             "body": {
#                 "date_time": {
#                     # "value": null,
#                     "type": "datetime"
#                 },
#                 "flight_no": {
#                     # "value": null,
#                     "type": "str"
#                 }
#             }
#         },
#         "output": {
#
#         },
#         "status": 0.0,
#         "fake_response": "晴天",
#         "domain": "http://192.168.31.6:5000",
#         "name": "预测天气",
#         "usage_count": 1.0,
#         "favor_users": [
#             # ObjectId("5a814496d845c06a361614ed")
#         ]
#     }
# ]
# if __name__ == "__main__":
#     test_create_app()
