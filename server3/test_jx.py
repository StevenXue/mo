# -*- coding: UTF-8 -*-
import sys
from bson import ObjectId
from flask import jsonify
from mongoengine import connect
from .repository import config
from .entity.staging_data_set import StagingDataSet
from .utility import json_utility
from .business import staging_data_set_business
from .service import staging_data_service
from mongoengine.document import MapReduceDocument
from .lib import data_manager
from bson import Code
from .entity.staging_data import StagingData
from .entity.staging_data_set import StagingDataSet
from .entity.staging_data_set import SubDataSet



# 使得 sys.getdefaultencoding() 的值为 'utf-8'
reload(sys)                      # reload 才能调用 setdefaultencoding 方法
sys.setdefaultencoding('utf-8')  # 设置 'utf-8'

connect(
    db=config.get_mongo_db(),
    username=config.get_mongo_user(),
    password=config.get_mongo_pass(),
    host=config.get_mongo_host(),
)

# ------
# print staging_data_service.get_fields_with_types(ObjectId(
#     '59341201df86b26b1f12f924'))
# print staging_data_service.get_fields_with_types(ObjectId("592917341c5ad409b07335e6"))

# ----
# Random test
# staging_data_set_business.get_by_id(ObjectId('59303bda1c5ad41cdb2bba9b'))
# staging_data_set_business.get_by_project_id(ObjectId('59259247e89bde050b6f02d4'))

# ----
# test for sub_staging_data_set
# SubDataSet(name='wtf',
#            description='qqq',
#            project=ObjectId('59259247e89bde050b6f02d4'),
#            purpose=0,
#            data=[ObjectId('592917341c5ad409b07335e8'),
#                  ObjectId('592917341c5ad409b07335e7')],
#            parent_set=ObjectId('592917341c5ad409b07335e6')).save()



# ------
# Test for MapReduceDocument()
#
# mapper = Code("""
#     function() {
#                     for (var key in this) { emit(key, typeof this[key]); }
#                   //for (var key in this) { emit(key, this[key]); }
#                }
# """)
# reducer = Code("""
#     function(key, stuff) { return null; }
# """)
#
# result = StagingData.objects(ListingId='126541').map_reduce(mapper, reducer, 'inline')
# # print isinstance(result, MapReduceDocument)
# # print list(result)
# for mp_doc in result:
#     # print isinstance(mp_doc, MapReduceDocument)
#     print 'type:%s, value:%s' % (mp_doc.value, mp_doc.key)

# distinctThingFields = db.staging_data.map_reduce(mapper, reducer
#                                            , out = {'inline' : 1}
#                                            , full_response = True)
# field_list = [i['_id'] for i in distinctThingFields['results']]
# for field in field_list:
#     print field

# staging_data_service.get_fields_with_types(ObjectId("592917341c5ad409b07335e6"))


# def get_field_names(collection):
#     """
#     get all field names of a collection
#     """
#     # collection = 'operation_detail_logs'
#     map = Code(
#         """
#         function() {
#             for (var key in this)
#                 {emit(key, null);}
#         }
#         """
#     )
#     reduce = Code(
#         """
#         function(key, stuff) {
#             return null;
#         }
#         """
#     )
#     results = mongo_manager.map_reduce_basic(collection, map, reduce,
#                                              {"inline": 1})
#     fields_list = [i['_id'] for i in results['results']]
#
#     return fields_list

# ---------------
# Test for find()
# query = {"总待还本金": "8712.73"}
# query = {'性别':'男', '借款期限': '12', '借款金额': '20000'}
# data = data_manager.find(query, '592917341c5ad409b07335e6')
# for d in data:
#     print d[u'借款金额']

# # --------------------------
# # Test block of data_manager.py
# # print type([1,2,3])
# # print type(data_manager.list_staging_data_set('59259247e89bde050b6f02d4'))
# sds_list = data_manager.list_staging_data_set('59259247e89bde050b6f02d4')
# print sds_list
# # for elem in sds_list:
# #     print elem
#
# field_list = data_manager.list_fields('592917341c5ad409b07335e6')
# # field_list = data_manager.list_fields('5928f1a81c5ad40862d93542')
#
# for field in field_list:
#     print field
#
# sd_data = data_manager.get_staging_data('592917341c5ad409b07335e6')
# # sd_data = data_manager.get_staging_data('5928f1a81c5ad40862d93542')
#
# print len(sd_data)
# for sd_obj in sd_data:
#     # transformed_obj = json_utility.convert_to_json(sd_obj.to_mongo().to_dict())
#     print isinstance(sd_obj[u'征信认证'], unicode), sd_obj[u'征信认证']
#     # print unicode(transformed_obj, 'utf-8').encode('utf-8')

# --------------------------
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