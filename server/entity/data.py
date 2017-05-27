# -*- coding: UTF-8 -*-

from mongoengine import *


class Data(DynamicDocument):
    data_set = ReferenceField('DataSet', required=True)
    # value = FloatField()
    # time = DateTimeField()

    # meta = {'allow_inheritance': True}
