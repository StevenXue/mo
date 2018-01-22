# -*- coding: UTF-8 -*-

from server3.entity.api import Api
from server3.repository.general_repo import Repo

api_repo = Repo(Api)


# def add(data_set, other_fields_dict):
#     if not data_set or not other_fields_dict:
#         raise ValueError('no data_set or no other_fields')
#     return data_repo.create(Data(data_set=data_set, **other_fields_dict))


def get_by_api_id(api_id):
    return api_repo.read_by_id(api_id)


# 通过url字段找api
def get_by_url(url):
    return api_repo.read({"url": url})


# 通用的通过通用字段找
def get_api_by_query(query_dict):
    return api_repo.read(query_dict)


def remove_by_id(api_id):
    return api_repo.delete_by_id(api_id)


def update_by_id(api_id, **update):
    return api_repo.update_one_by_id(api_id, update)


def add_api(json):
    api = Api(**json)
    return api_repo.create(api)


def get_all():
    return api_repo.read({})


if __name__ == '__main__':
    api_json = {
        "url": "/predict_flight_delay",
        "keyword": "预测 航班 延误",
        "description": "通过航班号，时间预测您的航班延误情况",
        "http_req": "GET",
        "input": {
            "body": {
                "date_time": {
                    "value": None,
                    "type": "datetime"
                },
                "flight_no": {
                    "value": None,
                    "type": "str"
                }
            }
        },
        "output": {

        },
        "status": 0,
        "fake_response": "预计延迟3小时",
        "domain": "http://192.168.31.6:5000"
    }
    result = add_api(api_json)
    print("result", result)
