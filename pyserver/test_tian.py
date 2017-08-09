# -*- coding: UTF-8 -*-
"""
"""
from mongoengine import connect
import numpy as np
from server3.lib import toolkit_orig, preprocess_orig
from server3.repository import config
from server3.service import toolkit_service, job_service, visualization_service

from server3.business import toolkit_business
# from .business import staging_data_business, staging_data_set_business, model_business
# # from server3.entity.toolkit import Toolkit
# from .entity.staging_data_set import StagingDataSet
# from bson import ObjectId
# from server3.lib.data_manager import get_staging_data_pandas

connect(
    db=config.get_mongo_db(),
    username=config.get_mongo_user(),
    password=config.get_mongo_pass(),
    host=config.get_mongo_host(),)

def log(func):
    def wrapper(*args, **kw):
        print('call %s()' % func.__name__)
        func(*args, **kw)
        print('call %s() after' % func.__name__)
        return
    return wrapper

@log
def now(arr0, arr1, k):
    print('love wyt')

def a(*args):
    print(args[0], args[1], args[2])

def test(a,b,c=3):
    print('a', a)
    print('b', b)
    print('c', c)

if __name__ == '__main__':
    '# 创建所有的public toolkit'
    # toolkit_business.create_public_toolkit()
    # toolkit_business.create_public_data_process()
    toolkit_business.update_one_public_toolkit()

    # 删除一个public toolkit和它的ownership
    # 593a27a88be34db7c6e24349
    # toolkit_business.remove_one_public_toolkit()

    # 更新一个model
    # model_business.update_one_public_model()

    # 通过名字找
    # a = toolkit_business.get_by_toolkit_name('平均值')
    # print a.to_mongo(

    # 通过id找
    # b = toolkit_business.get_by_toolkit_id(ObjectId("592546b18be34d179b95d96f"))
    # print b.to_mongo()

    # 找到所有的public toolkit
    # c = toolkit_service.get_all_public_toolkit()
    # print len(c)

    # 联动dataset调试toolkit计算，已废除
    # data = staging_data_business.get_by_staging_data_set_and_fields(ObjectId("5926d6291c5ad4881f4d060a"),fields=["name","device_type"])
    # temp = [d.to_mongo() for d in data]s

    # # print toolkit_code.dict_of_toolkit['最大互信息数']([1,2,3,4,10],[2,3,3,4,5]).to_mongo().to_dict()
    # # print toolkit_service.toolkit_calculate("59266bd08be34d2b2362f91e",[1,2,3,4,5],[2,3,4,5,6])

    # 重构后联动调试计算结果
    # a = [{'a':1,"b":0.11,"c":111,"d":0.3},{'a':2,"b":0.12,"c":2,"d":11.3},{'a':3,"b":0.13,"c":1111,"d":78.3},{'a':5,"b":0.15,"c":0.1,"d":0.3},{'a':8,"b":0.18,"c":9,"d":9.3}]
    # b = [{'a':1},{'a':2},{'a':4},{'a':3},{'a':5},{'a':"None"}]
    # print toolkit_service.convert_json_and_calculate("5925b208e89bde050b6f02d8", "59303bda1c5ad41cdb2bba9b", "59301a628be34d0f7bd9cc5b", a, 2)

    # 转换dataFrame格式
    # print (get_staging_data_pandas("5951cf7244a6372a608ec4e4"))

    # 测量假设检验函数
    # array = list(np.arange(142, 157, 0.1))
    # arr = []
    # for i in array:
    #     arr.append({'a': str(i)})
    # result = visualization_service.usr_story1_exploration(arr, 'str', group_num=10)
    # print (result)

    # 测getattr
    # print (hasattr(toolkit_orig, "toolkit_average"))
    # f = getattr(toolkit_orig, "toolkit_average")
    # print ('f', f)
    # result = f([1,2,3,4])
    # print (result)