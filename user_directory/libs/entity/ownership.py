# -*- coding: UTF-8 -*-

from mongoengine import *

from entity.toolkit import Toolkit
from entity.file import File
from entity.data_set import DataSet
from entity.project import Project
from entity.model import Model
from entity.user import User

OWNERSHIP_LEVEL = ('public', 'private')


class Ownership(Document):
    private = BooleanField(required=True)
    user = ReferenceField(User, required=True)
    project = ReferenceField(Project, reverse_delete_rule=CASCADE)
    data_set = ReferenceField(DataSet, reverse_delete_rule=CASCADE)
    model = ReferenceField(Model, reverse_delete_rule=CASCADE)
    toolkit = ReferenceField(Toolkit, reverse_delete_rule=CASCADE)
    file = ReferenceField(File, reverse_delete_rule=CASCADE)

