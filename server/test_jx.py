# -*- coding: UTF-8 -*-
import sys
from bson import ObjectId
from flask import jsonify
from mongoengine import connect
from repository import config

from utility import json_utility
from business import staging_data_set_business
from service import staging_data_service

from lib import data_manager

# 使得 sys.getdefaultencoding() 的值为 'utf-8'
reload(sys)                      # reload 才能调用 setdefaultencoding 方法
sys.setdefaultencoding('utf-8')  # 设置 'utf-8'

connect(
    db=config.get_mongo_db(),
    username=config.get_mongo_user(),
    password=config.get_mongo_pass(),
    host=config.get_mongo_host(),
)

# Test block of data_manager.py
# print type([1,2,3])
# print type(data_manager.list_staging_data_set('59259247e89bde050b6f02d4'))
sds_list = data_manager.list_staging_data_set('59259247e89bde050b6f02d4')
print sds_list
# for elem in sds_list:
#     print elem

field_list = data_manager.list_fields('592917341c5ad409b07335e6')
# field_list = data_manager.list_fields('5928f1a81c5ad40862d93542')

for field in field_list:
    print field

sd_data = data_manager.get_staging_data('592917341c5ad409b07335e6')
# sd_data = data_manager.get_staging_data('5928f1a81c5ad40862d93542')

print len(sd_data)
for sd_obj in sd_data:
    # transformed_obj = json_utility.convert_to_json(sd_obj.to_mongo().to_dict())
    print isinstance(sd_obj[u'征信认证'], unicode), sd_obj[u'征信认证']
    # print unicode(transformed_obj, 'utf-8').encode('utf-8')

# Test for reference field
# staging_data_set_business.add('a', 'b', ObjectId('59259247e89bde050b6f02d4'))

# Test for create project
# project_service.create_project("testasdfasdf", "adsfafd",
#    'test_user', True)

# Test for add staging_data_set / staging_data
# to save some test staging_data_set and staging_data
# staging_data_service.add_staging_data_set_by_data_set_id(
#     'bbb', 'bbb', ObjectId('59259247e89bde050b6f02d4'),
#     ObjectId("5928263fe89bde02aa287328"))


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