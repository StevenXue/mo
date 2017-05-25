# -*- coding: UTF-8 -*-

from mongoengine import connect

from repository import config

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

    def update_one_by_id(self, obj, update):
        modified_obj = self.__instance.objects(id=obj.id).modify(**update)
        return modified_obj.reload()

    def delete(self, obj):
        return obj.delete()

    def delete_first_one(self, query):
        return self.__instance.objects(**query).first().delete()

    def delete_unique_one(self, query):
        return self.__instance.objects.get(**query).delete()

    def delete_by_id(self, obj):
        return self.__instance.objects.get(id=obj.id).delete()
