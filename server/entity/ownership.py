from mongoengine import *

OWNERSHIP_LEVEL = ('public', 'private')


class Ownership(Document):
    level = StringField(required=True, choices=OWNERSHIP_LEVEL)
    owner = ReferenceField('User', required=True)
    project = ReferenceField('Project')
    data_set = ReferenceField('DataSet')
    model = ReferenceField('Model')
    toolkit = ReferenceField('Toolkit')

