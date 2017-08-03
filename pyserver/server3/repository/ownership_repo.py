# -*- coding: UTF-8 -*-
from server3.entity.user import User as Instance
from server3.repository.general_repo import Repo


class OwnershipRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def read_by_type_and_private(self, owned_type, is_private):
        return Repo.read(self, {'private': is_private,
                                '%s__exists' % owned_type: True})

    def read_by_item(self, owned_type, owned_item):
        return Repo.read_unique_one(self, {owned_type: owned_item})

    def delete_by_item(self, owned_item, owned_type):
        return Repo.delete_unique_one(self, {owned_type: owned_item})




