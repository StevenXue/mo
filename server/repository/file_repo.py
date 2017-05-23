# -*- coding: UTF-8 -*-
from datetime import datetime

from server.repository.general_repo import Repo


class FileRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def save_custom(self, file_obj):
        # do some custom
        return Repo.save(self, file_obj)

    def read_by_user(self, file_obj):
        return Repo.find_unique_one(self, {'user': file_obj.user})

    def delete_by_object_id(self, file_obj):
        return Repo.find_unique_one(self, {'_id': file_obj.object_id}).delete()
