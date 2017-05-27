# -*- coding: UTF-8 -*-

from mongoengine import *


# TODO Need to be confirmed
class Model(Document):
    name = StringField(max_length=50)
