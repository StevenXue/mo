# -*- coding: UTF-8 -*-
from mongoengine import Document
from mongoengine import StringField
from mongoengine import EmailField
from mongoengine import IntField

GENDER = (
    (0, 'female'),
    (1, 'male')
)


class User(Document):
    user_ID = StringField(max_length=20, unique=True, required=True)
    password = StringField(required=True)
    name = StringField(max_length=50)
    email = EmailField(unique=True)
    phone = StringField(unique=True)
    gender = IntField(choices=GENDER)
    age = IntField()
