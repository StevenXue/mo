# -*- coding: UTF-8 -*-

from mongoengine import Document
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import IntField
from mongoengine import BooleanField
from mongoengine import ReferenceField
from mongoengine import CASCADE

from server3.constants import ALLOWED_EXTENSIONS

# zip will be automatically unzip as a folder
EXTENSION = tuple(ALLOWED_EXTENSIONS)
FILE_TYPE = ('table', 'image', 'text', 'audio', 'video')


class File(Document):
    name = StringField(max_length=50, required=True)
    description = StringField(max_length=140)
    upload_time = DateTimeField(required=True)
    url = StringField(unique=True, required=True)
    uri = StringField(required=True)
    size = IntField()
    extension = StringField(choices=EXTENSION)
    type = StringField(choices=FILE_TYPE)
    user_name = StringField(max_length=50)
    predict = BooleanField()
    data_set = ReferenceField('DataSet', reverse_delete_rule=CASCADE)


