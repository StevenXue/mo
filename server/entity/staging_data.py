from mongoengine import *

from entity.data import Data


class StagingData(Document):
    time = DateTimeField()
    data_set = ReferenceField('DataSet')
    value = FloatField()

