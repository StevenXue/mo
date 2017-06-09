#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-06-09 14:00pm
# @function : Getting all of the Model of Machine Learning
# @running  : python
# Further to FIXME of None
"""

from repository.general_repo import Repo


class ModelRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def read_by_model_name(self, model_obj):
        return Repo.read_unique_one(self, {'name': model_obj.name})
