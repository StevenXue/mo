# -*- coding: UTF-8 -*-
"""
"""
from mongoengine import connect
from repository import config
from business import toolkit_business
from business import staging_data_business
from service import toolkit_service
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
    pass

    toolkit_business.create_public_toolkit()
    # a = toolkit_business.get_by_toolkit_name('平均值')
    # b = toolkit_business.get_by_toolkit_id(ObjectId("592546b18be34d179b95d96f"))
    # print b.to_mongo()
    # c = toolkit_service.get_all_public_toolkit()
    # print c
    # print a.to_mongo()
    # f = open('./run.py')
    # print f.read()
    # a = [1,2,3,4,5]
    # print AVG.toolkit_average(a)
    # print STD.toolkit_std(a)
    # now([1, 2], [2, 3], 3)
    # b = a
    # b(1,2,3,4,5)
    # data = staging_data_business.get_by_staging_data_set_and_fields(ObjectId("5926d6291c5ad4881f4d060a"),fields=["name","device_type"])
    # temp = [d.to_mongo() for d in data]
    # print temp, "\n"
    # # print int('\u667a\u80fd\u7535\u8868\u8f93\u51fa\u67dc1\u7535\u529b\u5ba42_PD194E-9FY')
    # # print toolkit_code.dict_of_toolkit['最大互信息数']([1,2,3,4,10],[2,3,3,4,5]).to_mongo().to_dict()
    # # print toolkit_service.toolkit_calculate("59266bd08be34d2b2362f91e",[1,2,3,4,5],[2,3,4,5,6])
    # df = toolkit_business.convert_json_str_to_dataframe(temp)
    # print df
    # print df[0]
    # print df[1]
    # a = [{'a':1,"b":2},{'a':1,"b":2},{'a':1,"b":2},{'a':1,"b":2},{'a':1,"b":2},{'a':1,"b":2}]
    # b = [{'a':1},{'a':2},{'a':4}]
    # print toolkit_service.convert_json_and_calculate("59266bd08be34d2b2362f90e", "59259247e89bde050b6f02d4", b,0)
    argv = [1,2,4]
    test(*argv)
