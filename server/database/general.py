# -*- coding: UTF-8 -*-


def find(instance, **query):
    return instance.objects(**query)


def find_one(instance, **query):
    return instance.objects(**query)[0]


def find_unique_one(instance, **query):
    return instance.objects.get(**query)


def save_one(instance, **content):
    return instance(**content).save()


# def modify(instance, **query, **update):
#     return instance.objects(**query).modify(**update)

