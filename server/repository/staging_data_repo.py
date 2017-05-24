# -*- coding: UTF-8 -*-

from repository.general_repo import Repo


class StagingDataRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)
