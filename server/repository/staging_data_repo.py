# -*- coding: UTF-8 -*-

from repository.general_repo import Repo


class StagingDataRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def read_by_staging_data_set(self, staging_data_set):
        return Repo.read(self, {'staging_data_set': staging_data_set.id})

    def read_first_one_by_staging_data_set(self, staging_data_set):
        return Repo.read_first_one(self, {'staging_data_set': staging_data_set.id})

    def get_by_staging_data_set_and_fields(self, staging_data, fields):
        return Repo.read(self, {'staging_data_set':
                                staging_data.staging_data_set}).fields(
                                **{field: 1 for field in fields})
