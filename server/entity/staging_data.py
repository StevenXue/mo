from mongoengine import *

from server.entity.data import Data


class StagingData(Document):
    time = DateTimeField()
    data_set = ReferenceField('DataSet')
    value = FloatField()

