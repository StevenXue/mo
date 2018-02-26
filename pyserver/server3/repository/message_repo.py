# -*- coding: UTF-8 -*-
from server3.repository.general_repo import Repo


class MessageRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)


class ReceiverRepo(Repo):
    def __init__(self, instance):
        Repo.__init__(self, instance)
