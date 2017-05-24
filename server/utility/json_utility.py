# encoding: utf-8
"""
utility used in all project

Author: BingWei Chen
Date: 2017.05.17
"""
import json

from bson import ObjectId
from datetime import datetime


class JSONEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, ObjectId):
            return str(o)
        elif isinstance(o, datetime):
            return str(o)
        return json.JSONEncoder.default(self, o)


def json_load(json_string):
    json_obj = json.loads(json_string)
    return json_obj


# convert bson to json
# 将ObjectId去除，用于Restful API传递
def convert_to_json(bson_obj):
    new_json_obj = JSONEncoder().encode(bson_obj)
    new_json_obj = json_load(new_json_obj)
    return new_json_obj


# # 获取ObjectId的实例内容
# def get_object(collection, object_id):
#     return mongo_manager.find_one(collection, {"_id": object_id})


# 将string转成datetime
def convert_string_to_date(timestamp):
    if isinstance(timestamp, datetime):
        return timestamp
    timestamp = datetime.strptime(timestamp, '%Y-%m-%d %H:%M:%S')
    return timestamp
