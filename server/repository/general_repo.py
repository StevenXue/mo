# -*- coding: UTF-8 -*-

from mongoengine import connect

from server.repository import config

connect(
    db=config.get_mongo_db(),
    username=config.get_mongo_user(),
    password=config.get_mongo_pass(),
    host=config.get_mongo_host(),
)


class Repo:
    def __init__(self, instance):
        self.__instance = instance

    def find(self, query):
        return self.__instance.objects(**query)

    def find_first_one(self, query):
        return self.__instance.objects(**query).first()

    def find_unique_one(self, query):
        return self.__instance.objects.get(**query)

    def save_one(self, content):
        return self.__instance(**content).save()

    def save(self, obj):
        return obj.save()

# def modify(instance, **query, **update):
#     return instance.objects(**query).modify(**update)

