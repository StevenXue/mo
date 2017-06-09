# -*- coding: UTF-8 -*-
import sys

from bson.objectid import ObjectId

from server.business import staging_data_business
from service import staging_data_service
from utility import json_utility

# 使得 sys.getdefaultencoding() 的值为 'utf-8'
reload(sys)                      # reload 才能调用 setdefaultencoding 方法
sys.setdefaultencoding('utf-8')  # 设置 'utf-8'


def find(query_str_in_mongodb_form, staging_data_set_id):
    data = staging_data_service.\
        find_by_query_str(ObjectId(staging_data_set_id),
                          **query_str_in_mongodb_form)
    return convert_staging_data_objects_to_json(data)


def get_staging_data(staging_data_set_id):
    """
    Get staging_data by staging_data_set_id

    :param staging_data_set_id: ObjectId
    :return:  stating_data in JSON format
    """
    data = staging_data_business.\
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
    sd_objects = staging_data_service.\
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


if __name__ == '__main__':
    pass