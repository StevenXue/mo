from mongoengine import *

DATA_SET_TYPE = ('type1', 'type2')


class DataSet(Document):
    name = StringField(max_length=20, unique=True, required=True)
    description = StringField(max_length=140)
    # type = StringField(required=True, choices=DATA_SET_TYPE)
    # ownership = ReferenceField('Ownership', required=True)
