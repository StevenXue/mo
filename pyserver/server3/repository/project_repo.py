# -*- coding: UTF-8 -*-

from server3.repository.general_repo import Repo


class ProjectRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    # def read_by_name(self, project_obj):
    #     return Repo.read_unique_one(self, {'name': project_obj.name})
