# -*- coding: UTF-8 -*-
from mongoengine import *

GENDER = ('male', 'female')


class User(Document):
    user_ID = StringField(max_length=20, unique=True)
    name = StringField(max_length=20, unique=True)
    password = StringField(min_length=6, max_length=20)
    email = EmailField(unique=True)
    phone = IntField(unique=True)
    gender = StringField(choices=GENDER)
    age = IntField()

