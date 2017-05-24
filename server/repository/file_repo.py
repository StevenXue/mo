# -*- coding: UTF-8 -*-
from datetime import datetime

from repository.general_repo import Repo


class FileRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def create_custom(self, file_obj):
        # do some custom
        return Repo.create(self, file_obj)

    def read_by_user(self, file_obj):
        return Repo.read(self, {'user': file_obj.user})

    def read_by_id(self, file_obj):
        return Repo.read_unique_one(self, {'id': file_obj.id})

    def delete_by_id(self, file_obj):
        return Repo.read_unique_one(self, {'id': file_obj.id}).delete()
