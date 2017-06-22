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
