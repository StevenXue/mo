# -*- coding: UTF-8 -*-

from mongoengine import DynamicDocument
from mongoengine import StringField
from mongoengine import ListField
from mongoengine import DateTimeField
from mongoengine import IntField
from mongoengine import BooleanField
from mongoengine import ReferenceField
from mongoengine import EmbeddedDocumentField

from server3.constants import ALLOWED_EXTENSIONS

# zip will be automatically unzip as a folder
EXTENSION = tuple(ALLOWED_EXTENSIONS)
FILE_TYPE = ('table', 'image', 'text', 'audio', 'video')
DATA_SET_TYPE = ('type1', 'type2')
RELATED_FIELDS = ('Business', 'Government', 'Education', 'Environment',
                  'Health', 'Housing & Development', 'Public Services',
                  'Social', 'Transportation', 'Science', 'Technology')


class DataSet(DynamicDocument):
    name = StringField(max_length=50, required=True)
    description = StringField(max_length=140)
    related_field = StringField(max_length=100, choices=RELATED_FIELDS)
    tags = ListField(StringField(max_length=50))
    related_tasks = ListField(StringField(max_length=50))
    user_name = StringField(max_length=50)
    file = ReferenceField('File')
    # file_obj = EmbeddedDocumentField('File')
    # meta = {'allow_inheritance': True}
    # url = StringField(unique=True, required=True)
    # uri = StringField(unique=True, required=True)
    # extension = StringField(choices=EXTENSION, required=True)
    # type = StringField(choices=FILE_TYPE, required=True)
    # predict = BooleanField(required=True)
    # upload_time = DateTimeField()
    # size = IntField()

# class FileDataSet(DataSet):
#     upload_time = DateTimeField(required=True)
#     url = StringField(unique=True, required=True)
#     uri = StringField(required=True)
#     size = IntField()
#     extension = StringField(choices=EXTENSION)
#     type = StringField(choices=FILE_TYPE)
#     predict = BooleanField()
