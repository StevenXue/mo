# -*- coding: UTF-8 -*-

from entity.staging_data_set import StagingDataSet
from repository.staging_data_set_repo import StagingDataSetRepo

staging_data_set_repo = StagingDataSetRepo(StagingDataSet)


def get_by_name(name):
    sds = StagingDataSet(name=name)
    return staging_data_set_repo.read_by_name(sds)
