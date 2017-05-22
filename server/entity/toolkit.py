from mongoengine import *


class Toolkit(Document):
    name = StringField(max_length=50, unique=True)
    category = StringField(max_length=50, unique=True)
