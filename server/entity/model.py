from mongoengine import *


class Model(Document):
    name = StringField(max_length=50)
