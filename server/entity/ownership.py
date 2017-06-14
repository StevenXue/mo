# -*- coding: UTF-8 -*-

from mongoengine import *

OWNERSHIP_LEVEL = ('public', 'private')


class Ownership(Document):
    private = BooleanField(required=True)
    user = ReferenceField('User', required=True)
    project = ReferenceField('Project', reverse_delete_rule=CASCADE)
    data_set = ReferenceField('DataSet', reverse_delete_rule=CASCADE)
    model = ReferenceField('Model', reverse_delete_rule=CASCADE)
    toolkit = ReferenceField('Toolkit', reverse_delete_rule=CASCADE)
    file = ReferenceField('File', reverse_delete_rule=CASCADE)

