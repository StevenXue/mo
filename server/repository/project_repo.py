# -*- coding: UTF-8 -*-
import sys

from os import path
from repository.general_repo import Repo

sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))


class ProjectRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def create(self, project):
        return Repo.create(project)
