# -*- coding: UTF-8 -*-
from mongoengine import *


class StagingDataSet(Document):
    project = ReferenceField('Project', required=True)
    name = StringField(max_length=50, required=True, unique_with='project')
    description = StringField(max_length=140)
    # TODO when import the type of fields will be specified
    # stage = StringField(required=True, choices=STAGES)
    # source_data_sets = ListField(ReferenceField('DataSet'))
