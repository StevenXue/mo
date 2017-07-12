#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 11:00pm
# @function : Getting all of the toolkit of statics analysis
# @running  : python
# Further to FIXME of None
"""
from server3.repository.general_repo import Repo


class ToolkitRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def read_by_toolkit_name(self, toolkit_obj):
        return Repo.read_unique_one(self, {'name': toolkit_obj.name})

    # def read_by_toolkit_id(self, toolkit_obj):
    #     return Repo.read_unique_one(self, {'id': toolkit_obj.id})

    # def read_all_toolkit(self, toolkit_obj):
    #     return Repo.read(self, {})
