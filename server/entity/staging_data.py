from mongoengine import *


class StagingData(DynamicDocument):
    staging_data_set = ReferenceField('StagingDataSet')
