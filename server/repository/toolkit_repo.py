#!/usr/bin/python
# -*- coding: UTF-8 -*-
'''
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 11:00pm
# @function : Getting all of the toolkit of statics analysis
# @running  : python
# Further to FIXME of None
'''
from repository.general_repo import Repo


class ToolkitRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def read_by_toolkit_name(self, toolkit_obj):
        return Repo.read_unique_one(self, {'name': toolkit_obj.name})

    def read_by_toolkit_id(self, toolkit_obj):
        return Repo.read_unique_one(self, {'_id': toolkit_obj._id})

    def read_all_toolkit(self, toolkit_obj):
        return Repo.read(self, {})

# def find(query):
#     return general_repo.find(User, query)
#
#
# def find_first_one(query):
#     return general_repo.find_first_one(User, query)


# def find_unique_one_by_user_ID(User, user_ID):
#     return general_repo.find_unique_one(User, {'user_ID': user_ID})


# def save_one(content):
#     return general_repo.save_one(User, content)
#
#
