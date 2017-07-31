# -*- coding: UTF-8 -*-

from mongoengine import Document
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import IntField

# zip will be automatically unzip as a folder
EXTENSION = ('csv', 'zip')
FILE_TYPE = ('table', 'image', 'text', 'audio')


class File(Document):
    name = StringField(max_length=50, required=True)
    upload_time = DateTimeField(required=True)
    url = StringField(unique=True, required=True)
    uri = StringField(required=True)
    size = IntField()
    extension = StringField(choices=EXTENSION)
    type = StringField(choices=FILE_TYPE)
    description = StringField(max_length=140)


