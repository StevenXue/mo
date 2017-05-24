# -*- coding: UTF-8 -*-

from repository.general_repo import Repo


class StagingDataSetRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)
