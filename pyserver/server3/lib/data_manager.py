# -*- coding: UTF-8 -*-
import sys

from bson import ObjectId
import pandas as pd

from server3.business import staging_data_business
from server3.service import staging_data_service
from server3.utility import json_utility


# # 使得 sys.getdefaultencoding() 的值为 'utf-8'
# reload(sys)                      # reload 才能调用 setdefaultencoding 方法
# sys.setdefaultencoding('utf-8')  # 设置 'utf-8'


def find(query_str_in_mongodb_form, staging_data_set_id):
    data = staging_data_service. \
        get_by_query_str(ObjectId(staging_data_set_id),
                         **query_str_in_mongodb_form)
    return convert_staging_data_objects_to_json(data)


def get_staging_data(staging_data_set_id):
    """
    Get staging_data by staging_data_set_id

    :param staging_data_set_id: ObjectId
    :return:  stating_data in JSON format
    """
    data = staging_data_business. \
        get_by_staging_data_set_id(ObjectId(staging_data_set_id))
    # transformed_data = convert_to_json([sd.to_mongo().to_dict() for sd in data])
    # return transformed_data
    return convert_staging_data_objects_to_json(data)


def list_staging_data_set(project_id):
    """
    Get current staging_data_set within one project

    :param project_id: ObjectId
    :return: list of staging_data_set in JSON format
    """
    sd_objects = staging_data_service. \
        list_staging_data_sets_by_project_id(ObjectId(project_id))
    # return [obj.to_mongo().to_dict() for obj in sd_objects]
    # return convert_to_json([obj.to_mongo().to_dict() for obj in sd_objects])
    return convert_staging_data_objects_to_json(sd_objects)


# def list_fields(staging_data_set_id):
#     """
#     List all fields of one staging_data_set
#
#     :param staging_data_set_id: ObjectId
#     :return: list of fields
#     """
#     data = staging_data_service.get_fields_with_types(
#         ObjectId(staging_data_set_id))
#     # return convert_to_json([elem[0] for elem in data])
#     return [elem[0] for elem in data]


def convert_staging_data_objects_to_json(staging_data_objects):
    return convert_to_json([obj.to_mongo().to_dict()
                            for obj in staging_data_objects])


def convert_to_json(data):
    """
    Convert python object into JSON format

    :param data:
    :return: data in JSON format
    """
    return json_utility.convert_to_json(data)


# # 从 Mongodb中读取数据并转到 pandas dataframe 或 Array格式
#
# import pandas as pd
# from pymongo import MongoClient
#
#
# def _connect_mongo(host, port, username, password, db):
#     """ A util for making a connection to mongo """
#
#     if username and password:
#         mongo_uri = 'mongodb://%s:%s@%s:%s/%s' % (
#         username, password, host, port, db)
#         conn = MongoClient(mongo_uri)
#     else:
#         conn = MongoClient(host, port)
#
#     return conn[db]
#
#
# def read_mongo(db, collection, field=None, query={}, host='localhost',
#                port=27017,
#                username=None, password=None, no_id=True, read_type="Array"):
#     """ Read from Mongo and Store into DataFrame """
#
#     # Connect to MongoDB
#     db = _connect_mongo(host=host, port=port, username=username,
#                         password=password, db=db)
#     if field is None:
#         cursor = db[collection].find(query)
#     else:
#         # 将要转得 field  从list 转到 dic，以便find函数使用
#         temp_ = dict(zip(field, [1] * len(field)))
#         # Make a query to the specific DB and Collection
#         cursor = db[collection].find(query, temp_)
#         # field 数
#         field_num = len(field)
#     # document 数
#     document_num = cursor.count()
#
#     if read_type == "DataFrame":
#         # Expand the cursor and construct the DataFrame
#         df = pd.DataFrame(list(cursor))
#
#         # Delete the _id
#         if no_id:
#             del df['_id']
#         return df
#     elif read_type == "Array":
#         arrays = []
#         cursor = [c for c in cursor]
#         #         arrays=[[c[field[i]] for c in cursor] for i in range(field_num)]
#         if field is None:
#             field = [k for k, v in cursor[0].items()]
#             field.remove("_id")
#             field_num = len(field)
#         arrays = [[c[field[i]] for c in cursor] for i in range(field_num)]
#         return arrays


def get_staging_data_pandas(staging_data_set_id):
    """
    Get staging_data by staging_data_set_id

    :param staging_data_set_id: ObjectId
    :return:  stating_data in pandas format
    """
    data = staging_data_business. \
        get_by_staging_data_set_id(ObjectId(staging_data_set_id))
    data = convert_to_json([d.to_mongo() for d in list(data)])
    return pd.DataFrame(data)


if __name__ == '__main__':
    pass
    # # test  环境：win10，py3  所需包：pandas，pymongo，
    # # 1.启动mongodb服务
    # # 启动 cmd 后输入 mongod.exe --dbpath c:\data\db
    # # 2.csv传入 mongodb数据库中
    # # 上传 location.csv 文件到 mongodb中, db名取为 test ，collection名取为 location
    # # 新打开 一个cmd ，输入
    # # mongoimport --db test --collection location --type csv --file location.csv --headerline
    # # 3.mongodb 导出到 pandas.DataFrame
    # print("********************************")
    # print("DataFrame格式:")
    # print("用户特定请求某些field：")
    # print(read_mongo('test', 'location', ["Name", "Age", "City"],
    #                  read_type="DataFrame"))
    # print("")
    # print("用户不指定field，返回所有：")
    # print(read_mongo('test', 'location', read_type="DataFrame"))
    # print("")
    # # # 4.mongodb 导出到 Array
    # print("****************")
    # print("Array格式:")
    # print("用户特定请求某些field：")
    # print(read_mongo('test', 'location', ["Name", "Age", "City"],
    #                  read_type="Array"))
    # print("")
    # print("用户不指定field，返回所有：")
    # print(read_mongo('test', 'location', read_type="Array"))
    # print("")
