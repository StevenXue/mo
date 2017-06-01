# -*- coding: UTF-8 -*-
"""
"""
from mongoengine import connect
from repository import config
from business import toolkit_business
from business import staging_data_business
from service import toolkit_service, job_service
# from entity.toolkit import Toolkit
from entity.staging_data_set import StagingDataSet
from bson import ObjectId
from lib import toolkit_code

connect(
    db=config.get_mongo_db(),
    username=config.get_mongo_user(),
    password=config.get_mongo_pass(),
    host=config.get_mongo_host(),)

def log(func):
    def wrapper(*args, **kw):
        print 'call %s()' % func.__name__
        func(*args, **kw)
        print 'call %s() after' % func.__name__
        return
    return wrapper

@log
def now(arr0, arr1, k):
    print 'love wyt'

def a(*args):
    print args[0], args[1], args[2]

def test(a,b,c=3):
    print 'a', a
    print 'b', b
    print 'c', c

if __name__ == '__main__':
    # 创建所有的public toolkit
    # toolkit_business.create_public_toolkit()

    # 通过名字找
    # a = toolkit_business.get_by_toolkit_name('平均值')
    # print a.to_mongo(

    # 通过id找
    # b = toolkit_business.get_by_toolkit_id(ObjectId("592546b18be34d179b95d96f"))
    # print b.to_mongo()

    # 找到所有的public toolkit
    # c = toolkit_service.get_all_public_toolkit()
    # print c

    # 联动dataset调试toolkit计算，已废除
    # data = staging_data_business.get_by_staging_data_set_and_fields(ObjectId("5926d6291c5ad4881f4d060a"),fields=["name","device_type"])
    # temp = [d.to_mongo() for d in data]

    # # print toolkit_code.dict_of_toolkit['最大互信息数']([1,2,3,4,10],[2,3,3,4,5]).to_mongo().to_dict()
    # # print toolkit_service.toolkit_calculate("59266bd08be34d2b2362f91e",[1,2,3,4,5],[2,3,4,5,6])

    # 重构后联动调试计算结果
    a = [{'a':1,"b":0.11},{'a':2,"b":0.12},{'a':3,"b":0.13},{'a':5,"b":0.15},{'a':8,"b":0.18}]
    b = [{'a':1},{'a':2},{'a':4}]
    print toolkit_service.convert_json_and_calculate("592fadb78be34d92802892f7", "59259247e89bde050b6f02d4", b, 1)
a
