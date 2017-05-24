from mongoengine import *


class Data(DynamicDocument):
    data_set = ReferenceField('DataSet')
    # value = FloatField()
    # time = DateTimeField()

    # meta = {'allow_inheritance': True}
