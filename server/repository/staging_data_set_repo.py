# -*- coding: UTF-8 -*-

from repository.general_repo import Repo


class StagingDataSetRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def read_by_name(self, staging_data_set):
        return Repo.read_unique_one(self, {'name': staging_data_set.name})

    def read_by_id(self, staging_data_set):
        return Repo.read_unique_one(self, {'id': staging_data_set.id})
