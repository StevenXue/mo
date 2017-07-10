# -*- coding: UTF-8 -*-

from mongoengine import DynamicDocument
from mongoengine import ReferenceField

from entity.data_set import DataSet


class Data(DynamicDocument):
    data_set = ReferenceField(DataSet, required=True)
    # value = FloatField()
    # time = DateTimeField()

    # meta = {'allow_inheritance': True}
