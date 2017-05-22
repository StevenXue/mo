from mongoengine import *


class Data(DynamicDocument):
    time = DateTimeField()
    data_set = ReferenceField('DataSet')
    value = FloatField()

    meta = {'allow_inheritance': True}
