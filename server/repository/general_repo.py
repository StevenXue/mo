# -*- coding: UTF-8 -*-

from mongoengine import connect

from server.repository import config_repo

connect(
    db=config_repo.get_mongo_db(),
    username=config_repo.get_mongo_user(),
    password=config_repo.get_mongo_pass(),
    host=config_repo.get_mongo_host(),
)


def find(instance, query):
    return instance.objects(**query)


def find_one(instance, query):
    return instance.objects(**query)[0]


def find_unique_one(instance, query):
    return instance.objects.get(**query)


def save_one(instance, content):
    return instance(**content).save()


# def modify(instance, **query, **update):
#     return instance.objects(**query).modify(**update)

