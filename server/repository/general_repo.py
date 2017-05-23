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

    def read(self, query):
        return self.__instance.objects(**query)

    def read_first_one(self, query):
        return self.__instance.objects(**query).first()

    def read_unique_one(self, query):
        return self.__instance.objects.get(**query)

    def create_one(self, content):
        return self.__instance(**content).save()

    def create(self, obj):
        return obj.save()

# def modify(instance, **query, **update):
#     return instance.objects(**query).modify(**update)

