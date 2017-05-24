from mongoengine import *


class File(Document):
    name = StringField(max_length=20)
    description = StringField(max_length=50)
    upload_time = DateTimeField()
    size = IntField()
    url = StringField()
    path = StringField(unique=True)
    # user = ReferenceField('User')

