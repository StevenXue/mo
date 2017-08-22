# -*- coding: UTF-8 -*-

from mongoengine import Document
from mongoengine import BooleanField
from mongoengine import ReferenceField
from mongoengine import CASCADE

# from server3.entity import Toolkit
# from server3.entity import File
# from server3.entity import DataSet
# from server3.entity import Project
# from server3.entity import Model
# from server3.entity import User

OWNERSHIP_LEVEL = ('public', 'private')


class Ownership(Document):
    private = BooleanField(required=True)
    user = ReferenceField('User', required=True)
    project = ReferenceField('Project', reverse_delete_rule=CASCADE)
    data_set = ReferenceField('DataSet', reverse_delete_rule=CASCADE)
    model = ReferenceField('Model', reverse_delete_rule=CASCADE)
    toolkit = ReferenceField('Toolkit', reverse_delete_rule=CASCADE)
    file = ReferenceField('File', reverse_delete_rule=CASCADE)
    served_model = ReferenceField('ServedModel', reverse_delete_rule=CASCADE)

