# -*- coding: UTF-8 -*-
from mongoengine import *

STAGES = ('input', 'training', 'testing')


class StagingDataSet(Document):
    project = ReferenceField('Project', required=True)
    name = StringField(max_length=20, required=True)
    description = StringField(max_length=140)
    # stage = StringField(required=True, choices=STAGES)
    # source_data_sets = ListField(ReferenceField('DataSet'))
