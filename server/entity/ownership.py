# -*- coding: UTF-8 -*-

from mongoengine import *

OWNERSHIP_LEVEL = ('public', 'private')


class Ownership(Document):
    private = BooleanField(required=True)
    user = ReferenceField('User', required=True)
    project = ReferenceField('Project')
    data_set = ReferenceField('DataSet')
    model = ReferenceField('Model')
    toolkit = ReferenceField('Toolkit')
    file = ReferenceField('File')

