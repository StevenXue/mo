# -*- coding: UTF-8 -*-
import uuid
import datetime

from server3.entity.api import Api
from server3.repository.general_repo import Repo
from server3.business import world_business
from server3.entity.world import CHANNEL
api_repo = Repo(Api)


def get(**kwargs):
    return api_repo.read(kwargs)


def add(name, user, **kwargs):
    """
    根据 name, userId 生成url
    未来提供自定义 url
    :param name:
    :type name:
    :param user:
    :type user:
    :param kwargs:
    :type kwargs:
    :return:
    :rtype:
    """
    # message = "{}创建了app{}".format(user.name, name)
    # world_business.system_send(channel=CHANNEL.api, message=message)
    url = "/" + user.user_ID + "/" + name + "/" + uuid.uuid4()
    create_time = datetime.datetime.utcnow()
    api = Api(name=name, user=user, url=url, create_time=create_time, update_time=create_time,
              **kwargs)
    return api_repo.create(api)


def get_all():
    return api_repo.read({})


def get_by_api_id(api_id):
    return api_repo.read_by_id(api_id)


def get_by_api_ids(api_ids):
    return [get_by_api_id(api_id) for api_id in api_ids]


# 通过url字段找api
def get_by_url(url):
    return api_repo.read({"url": url})


# 通用的通过通用字段找
def get_api_by_query(query_dict):
    return api_repo.read(query_dict)


def remove_by_id(api_id):
    return api_repo.delete_by_id(api_id)


def update_by_id(api_id, **update):
    # 增加最新更新时间
    update_time = datetime.datetime.utcnow()
    update["update_time"] = update_time
    return api_repo.update_one_by_id(api_id, update)


def increment_usage_count(api_id):
    api = get_by_api_id(api_id)
    api.usage_count += 1
    return api.save()


def delete(api_id):
    return api_repo.delete_by_id(api_id)


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
    result = add(api_json)
    print("result", result)
