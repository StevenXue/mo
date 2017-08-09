# -*- coding: UTF-8 -*-

from server3.repository.general_repo import Repo


class ProjectRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)


