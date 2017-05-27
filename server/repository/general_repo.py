# -*- coding: UTF-8 -*-
"""
Need to be FIXED, further think of how to save
"""
# TODO

from mongoengine import connect

from repository import config
from entity.data_set import DataSet
connect(
    db=config.get_mongo_db(),
    username=config.get_mongo_user(),
    password=config.get_mongo_pass(),
    host=config.get_mongo_host(),
)


class Repo:
    def __init__(self, instance):
        self.__instance = instance

    # def read_by_id(self, object_id):
    #     return self.__instance.objects.get(id=object_id)

    def create(self, obj):
        return obj.save()

    def create_one(self, content):
        return self.__instance(**content).save()

    def read(self, query):
        return self.__instance.objects(**query)

    def read_first_one(self, query):
        return self.__instance.objects(**query).first()

    def read_unique_one(self, query):
        return self.__instance.objects.get(**query)

    def read_by_id(self, obj):
        return self.__instance.objects.get(id=obj.id)

    def update(self, query, update):
        return self.__instance.objects(**query).update(**update)

    def update_one(self, query, update):
        return self.__instance.objects(**query).update_one(**update)

    def update_one_by_id(self, obj_id, update):
        # print '2', type(obj_id), obj_id
        modified_obj = self.__instance.objects(id=obj_id).modify(**update)
        # print '3', type(modified_obj)
        return modified_obj.reload()

    # for List field add only one new element- update={'job': new_job_obj,
    #                                                  'result': new_result_obj}
    def add_and_update_one_by_id(self, obj_id, update):
        # print '2*', type(obj), obj
        # print '3*', update
        update = {'push__' + k: v for k, v in update.items()}
        # for key in update.keys():
        #     update['push__'+key] = update.pop(key)
        # print 'update', update
        modified_obj = self.__instance.objects(id=obj_id).modify(**update)
        return modified_obj.reload()

    def delete(self, obj):
        return obj.delete()

    def delete_many(self, query):
        return self.__instance.objects(**query).delete()

    def delete_first_one(self, query):
        return self.__instance.objects(**query).first().delete()

    def delete_unique_one(self, query):
        return self.__instance.objects.get(**query).delete()

    def delete_by_id(self, obj):
        return self.__instance.objects.get(id=obj.id).delete()
