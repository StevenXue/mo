# -*- coding: UTF-8 -*-

from server3.repository.general_repo import Repo


class StagingDataSetRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    # def read_by_name(self, staging_data_set):
    #     return Repo.read_unique_one(self, {'name': staging_data_set.name})

    # def read_by_project(self, project):
    #     return Repo.read(self, {'project': project.id})

    def read_by_non_unique_field_without_result(self, field_name, field_value):
        return Repo.read(self, {field_name: field_value,
                                'type': {'$ne': 'result'}})
