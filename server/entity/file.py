from mongoengine import *


class File(Document):
    name = StringField(max_length=20, unique=True)
    description = StringField(max_length=50, unique=True)
    upload_time = DateTimeField()
    size = IntField()
    path = StringField()
    user = ReferenceField('User')

