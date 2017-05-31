# -*- coding: UTF-8 -*-
from mongoengine import *

GENDER = (
    (0, 'female'),
    (1, 'male')
)


class User(Document):
    user_ID = StringField(max_length=20, unique=True, required=True)
    password = StringField(min_length=6, max_length=20, required=True)
    name = StringField(max_length=50)
    email = EmailField(unique=True)
    phone = StringField(unique=True)
    gender = IntField(choices=GENDER)
    age = IntField()
