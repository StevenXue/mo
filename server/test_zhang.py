# -*- coding: UTF-8 -*-
"""
"""
from mongoengine import connect
from repository import config
from business import toolkit_business
from entity import toolkit
from bson import ObjectId
from lib import *


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

if __name__ == '__main__':
    pass
    # toolkit_business.create_public_toolkit()
    # a = toolkit_business.get_by_toolkit_name('平均值')
    # b = toolkit_business.get_by_toolkit_id(ObjectId("592546b18be34d179b95d96f"))
    # print b.to_mongo()
    # c = toolkit_business.list_public_toolkit_name()
    # print len(c)
    # print a.to_mongo()
    # f = open('./run.py')
    # print f.read()
    # a = [1,2,3,4,5]
    # print AVG.toolkit_average(a)
    # print STD.toolkit_std(a)
    # now([1, 2], [2, 3], 3)
