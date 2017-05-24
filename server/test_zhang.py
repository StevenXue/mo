# -*- coding: UTF-8 -*-
"""
"""
from mongoengine import connect
from repository import config
from entity.toolkit import Toolkit
from business import toolkit_business


connect(
    db=config.get_mongo_db(),
    username=config.get_mongo_user(),
    password=config.get_mongo_pass(),
    host=config.get_mongo_host(),)

if __name__ == '__main__':
    a = toolkit_business.get_by_toolkit_name('平均值')
    b = toolkit_business.get_by_toolkit_id("5924127f8be34d7b560c8cdd")
    c = toolkit_business.list_available_toolkits()
    # print isInstance(a, class)
    # print c
    # print a
    print [a.name]
