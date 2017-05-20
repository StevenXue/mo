from mongoengine import *

connect(
    db='admin',
    username='c9',
    password='sucks',
    host='10.52.14.181'
)


# meta data
class User(Document):
    name = StringField(max_length=20, unique=True)
    password = StringField(min_length=6, max_length=20)
    email = EmailField(unique=True)
    phone = IntField(unique=True)


class Ownership(Document):
    name = StringField(max_length=50)


class DataSet(Document):
    name = StringField(max_length=50, unique=True)


class Model(Document):
    name = StringField(max_length=50)


class ToolKit(Document):
    name = StringField(max_length=50, unique=True)


# data
class Temp(Document):
    time = DateTimeField()
    # should be link to data_set in sql, so may be not string
    temp_data_set_name = StringField(max_length=50)
    value = FloatField()


class Data(Document):
    time = DateTimeField()
    data_set = ReferenceField(DataSet)
    value = FloatField()


class Job(Document):
    model = DateTimeField()
    toolkit = ReferenceField(ToolKit)
    temp = ReferenceField(Temp)
    status = IntField()


class Result(Document):
    job = StringField(max_length=50)
    time = DateTimeField()
    result = FloatField()


