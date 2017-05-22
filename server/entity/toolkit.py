from mongoengine import *


class Toolkit(Document):

    object_id = StringField(max_length=20, unique=True)
    name = StringField(max_length=50, unique=True)
    description = StringField(max_length=50, unique=True)
    target_py = StringField(max_length=50, unique=True)
    parameter_spec =
    status
    ownership_ref




    name = StringField(max_length=50, unique=True)
    category = StringField(max_length=50, unique=True)

    user_id = StringField(max_length=20, unique=True)
    name = StringField(max_length=20, unique=True)
    password = StringField(min_length=6, max_length=20)
    email = EmailField(unique=True)
    phone = IntField(unique=True)
    gender = StringField(choices=GENDER)
    age = IntField()

    name = StringField(max_length=20, unique=True)
    description = StringField(max_length=50, unique=True)
    upload_time = DateTimeField()
    size = FloatField()
    path = StringField()
    user = ReferenceField('User')

    data_set = ReferenceField('DataSet')
    job = ReferenceField('Job')
    result = ReferenceField('Result')
    ownership = ReferenceField('Ownership')
