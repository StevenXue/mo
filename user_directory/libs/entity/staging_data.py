# -*- coding: UTF-8 -*-
from mongoengine import *

from entity.staging_data_set import StagingDataSet


class StagingData(DynamicDocument):
    staging_data_set = ReferenceField(StagingDataSet, required=True)
