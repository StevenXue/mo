# -*- coding: UTF-8 -*-
import math
from server3.repository.general_repo import Repo


class StagingDataRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    # def read_by_staging_data_set(self, staging_data_set):
    #     return Repo.read(self, {'staging_data_set': staging_data_set.id})

    def read_first_one_by_staging_data_set_id(self, staging_data_set_id):
        return Repo.read_first_one(self, {'staging_data_set':
                                              staging_data_set_id})

    def read_by_staging_data_set_and_fields(self, staging_data_set_id, fields,
                                            allow_nan=True, with_id=False):
        query = {'staging_data_set': staging_data_set_id}
        if allow_nan is False:
            for field in fields:
                # FIXME when field is integer in string will cause error
                query.update({field: {'$ne': math.nan}})
        # print(query)
        if with_id:
            if '_id' in fields:
                return Repo.read(self, query).fields(
                    **{field: 1 for field in fields})
        return Repo.read(self, query).fields(
            **{field: 1 for field in fields}).exclude('id')
