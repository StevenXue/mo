# -*- coding: UTF-8 -*-
from bson import ObjectId
from mongoengine import connect
from entity.project import Project
from business import project_business
from repository import config
from entity.data import Data
from entity.data_set import DataSet
from service import staging_data_service
from utility import json_utility



connect(
    db=config.get_mongo_db(),
    username=config.get_mongo_user(),
    password=config.get_mongo_pass(),
    host=config.get_mongo_host(),
)

# project_service.create_project("testasdfasdf", "adsfafd",
#    'test_user', True)

# to save some test staging_data_set and staging_data
# test_project = project_business.get_by_name('aaa')
# data_objects = Data.objects()
# staging_data_service.add_staging_data_set('aaa', 'bbb', test_project.id, data_objects)
staging_data_service.add_staging_data_set_by_data_set_id(
    'aaa', 'bbb', ObjectId('59269fb0e89bde25dfb873db'),
    ObjectId('592714d8df86b2a741b926ad'))

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