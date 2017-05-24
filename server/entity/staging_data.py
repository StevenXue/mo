from mongoengine import *

from entity.data import Data


class StagingData(Document):
    # time = DateTimeField()
    # value = FloatField()
    staging_data_set = ReferenceField('StagingDataSet')


