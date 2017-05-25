# -*- coding: UTF-8 -*-

from repository.general_repo import Repo


class StagingDataRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def get_by_staging_data_set(self, staging_data):
        return Repo.read(self, {'staging_data_set':
                                staging_data.staging_data_set})
