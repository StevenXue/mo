# -*- coding: UTF-8 -*-
from entity.user import User as Instance
from repository.general_repo import Repo


class OwnershipRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)

    def read_by_user(self, user):
        return Repo.read(self, {'user': user})

    def read_by_type_and_private(self, owned_type, is_private):
        return Repo.read(self, {'private': is_private,
                                '%s__exists' % owned_type: True})




