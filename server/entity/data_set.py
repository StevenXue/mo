from mongoengine import *

DATA_SET_TYPE = ('type1', 'type2')


class DataSet(Document):
    name = StringField(max_length=20, unique=True, required=True)
    description = StringField(max_length=140)
    # TODO when import the type of fields will be specified
    # fields_spec = DictField()

    # meta = {'allow_inheritance': True}
