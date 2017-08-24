#!/usr/local/bin/python3
# -*- coding: UTF-8 -*-
"""
# @author   : Zhaofeng Li
# @version  : 1.0
# @date     : 2017-08-22 14:00pm
# @running  : python
"""

from server3.repository.general_repo import Repo


class ServedModelRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)
