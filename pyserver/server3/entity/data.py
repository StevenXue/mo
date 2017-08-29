# -*- coding: UTF-8 -*-

from mongoengine import DynamicDocument
from mongoengine import ReferenceField
from mongoengine import CASCADE

# from server3.entity import DataSet


class Data(DynamicDocument):
    data_set = ReferenceField('DataSet', required=True,
                              reverse_delete_rule=CASCADE)
    # value = FloatField()
    # time = DateTimeField()

    # meta = {'allow_inheritance': True}
