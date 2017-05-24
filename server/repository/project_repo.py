# -*- coding: UTF-8 -*-

from repository.general_repo import Repo


class ProjectRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def read_by_id(self, project_obj):
        return Repo.read_unique_one(self, {'id': project_obj.id})
