# encoding: utf-8
"""
utility used in all project

Author: BingWei Chen
Date: 2017.05.17
"""
import json
import pandas as pd
import simplejson
import numpy as np

from bson import ObjectId
from datetime import datetime


class JSONEncoder(simplejson.JSONEncoder):
    # def default(self, o):
    #     if isinstance(o, ObjectId):
    #         return str(o)
    #     elif isinstance(o, datetime):
    #         return str(o)
    #     elif isinstance(o, np.integer):
    #         return int(o)
    #     elif isinstance(o, np.floating):
    #         return float(o)
    #     elif isinstance(o, np.ndarray):
    #         return o.tolist()
    #     return self.default(self, o)

    # arbitrary iterators
    def default(self, o):
        try:
            iterable = iter(o)
        except TypeError:
            if isinstance(o, ObjectId):
                return str(o)
            elif isinstance(o, datetime):
                return str(o)
            elif isinstance(o, np.ndarray):
                return o.tolist()
            elif isinstance(o, np.generic):
                return np.asscalar(o)
        else:
            return list(iterable)
        # Let the base class default method raise the TypeError
        return JSONEncoder.default(self, o)


def json_load(json_string):
    json_obj = json.loads(json_string)
    return json_obj


# convert bson to json
# 将ObjectId去除，用于Restful API传递
def convert_to_json(bson_obj):
    json_obj = JSONEncoder(ignore_nan=True).encode(bson_obj)
    # new_json_obj = json_load(new_json_obj)
    # new_json_obj = simplejson.dumps(new_json_obj, ignore_nan=True)
    new_json_obj = simplejson.loads(json_obj)
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


# 将json转化成DataFrame格式
def convert_json_str_to_dataframe(arr):
    """
    convert input data:
    from
        data from staging data => database_type like, which is a list of dicts
    to
        DataFrame in pandas
    """
    col = list(arr[0].keys())
    df_converted = pd.DataFrame([[i[j] for j in col] for i in arr],
                                columns=col)
    return df_converted


def me_obj_list_to_json_list(me_obj_list):
    """
    mongoengine object list to json list
    :param me_obj_list: list
    :return:
    """
    return [convert_to_json(me_obj.to_mongo()) for me_obj in
            me_obj_list]


def me_obj_list_to_dict_list(me_obj_list):
    """
    mongoengine object list to dict list
    :param me_obj_list: list
    :return:
    """
    return [me_obj.to_mongo().to_dict() for me_obj in me_obj_list]


def get_args(args):
    return {'args':
                {arg.get('name'): arg.get('value')
                                  or arg.get('values')
                                  or arg.get('default')
                 for arg in args}
            }


def args_converter(args):
    return {arg.get('name'): {'key': key, **arg}
            for key, arg in args.items()}


def objs_to_json_with_arg(objects, arg):
    return [{
        **convert_to_json(me_obj.to_mongo()),
        f'{arg}_obj': convert_to_json(me_obj[arg].to_mongo())} for me_obj in
            objects]


def objs_to_json_with_args(objects, args):
    return_objects = []
    for object in objects:
        new_object = convert_to_json(object.to_mongo())
        for arg in args:
            new_object[f'{arg}_obj'] = convert_to_json(object[arg].to_mongo())
        return_objects.append(new_object)
    return return_objects
    # return [
    #     {
    #     **convert_to_json(me_obj.to_mongo()),
    #
    #     **[{f'{arg}_obj': convert_to_json(me_obj[arg].to_mongo())} for arg in args]
    # } for me_obj in objects]
