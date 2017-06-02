# -*- coding: UTF-8 -*-
from mongoengine import *

SUB_SET_PURPOSE =(
    (0, 'training'),
    (1, 'testing')
)

class StagingDataSet(Document):
    project = ReferenceField('Project', required=True)
    name = StringField(max_length=50, required=True, unique_with='project')
    description = StringField(max_length=140)
    meta = {'allow_inheritance': True}
    # TODO when import the type of fields will be specified
    # stage = StringField(required=True, choices=STAGES)
    # source_data_sets = ListField(ReferenceField('DataSet'))


# TODO Need to discussion for future
class SubDataSet(StagingDataSet):
    purpose = IntField(choices=SUB_SET_PURPOSE, required=True)
    data = ListField(ReferenceField('StagingData'))
    parent_set = ReferenceField('StagingDataSet')