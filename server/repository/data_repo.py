# -*- coding: UTF-8 -*-
from entity.data import Data as Instance
from repository.general_repo import Repo


class DataRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def get_by_data_set(self, data):
        return Repo.read(self, {'data_set': data.data_set})




