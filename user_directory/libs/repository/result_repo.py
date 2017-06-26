#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-24 11:00pm
# @function : Getting all of the result of statics analysis
# @running  : python
# Further to FIXME of None
"""
from repository.general_repo import Repo


class ResultRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

