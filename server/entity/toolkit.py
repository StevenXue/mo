from mongoengine import *


class Toolkit(Document):
    name = StringField(max_length=50, unique=True, required=True)
    description = StringField(max_length=100)
    target_py = StringField(max_length=25, required=True)
    parameter_spec = DictField(required=True)
    status = DictField()
    # ownership_ref = StringField(max_length=20, unique=True)
