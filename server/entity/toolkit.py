from mongoengine import *


class Toolkit(Document):

    # object_id = StringField(max_length=20, unique=True)
    name = StringField(max_length=50, unique=True)
    description = StringField(max_length=100, unique=True)

    # target_py = StringField(max_length=25, unique=True)
    target_py = ReferenceField('File')

    # ownership_ref = StringField(max_length=20, unique=True)
    # ownership_ref = ReferenceField('Ownership')

    status = DictField()
    # status = IntField(choices=STATUS, required=True)

    parameter_spec = DictField()

