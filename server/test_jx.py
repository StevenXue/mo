# -*- coding: UTF-8 -*-
from bson import ObjectId
from mongoengine import connect

from repository import config
from business import staging_data_set_business
from utility import json_utility

from lib import data_manager


connect(
    db=config.get_mongo_db(),
    username=config.get_mongo_user(),
    password=config.get_mongo_pass(),
    host=config.get_mongo_host(),
)

# Test for referencefield
staging_data_set_business.add('a', 'b', ObjectId('59259247e89bde050b6f02d4'))

# project_service.create_project("testasdfasdf", "adsfafd",
#    'test_user', True)

# to save some test staging_data_set and staging_data
# staging_data_service.add_staging_data_set_by_data_set_id(
#     'bbb', 'bbb', ObjectId('59269fb0e89bde25dfb873db'),
#     ObjectId("592714d8df86b2a741b926ad"))

# to list fields of staging data
# staging_data_service.list_fields('aaa')



#
# for obj in data_objects:
#     list = [k for k,v in obj._fields.iteritems()]
#     print list
#     # print obj._fields.ListField()
#
# list = [k for k,v in Data._fields.iteritems()]
# print list

# data = json_utility.convert_to_json(data)
# staging_data_service.run()

# data_manager.list_staging_data_set('')