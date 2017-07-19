# -*- coding: UTF-8 -*-
from mongoengine import DynamicDocument
from mongoengine import ReferenceField
from mongoengine import StringField
from mongoengine import IntField
from mongoengine import ListField

SUB_SET_PURPOSE =(
    (0, 'training'),
    (1, 'testing')
)


class StagingDataSet(DynamicDocument):
    project = ReferenceField('Project', required=True)
    name = StringField(max_length=100, required=True, unique_with='project')
    description = StringField(max_length=140)
    job = ReferenceField('Job')
    meta = {'allow_inheritance': True}
    # TODO when import the type of fields will be specified
    # stage = StringField(required=True, choices=STAGES)
    # source_data_sets = ListField(ReferenceField('DataSet'))


# TODO Need to discussion for the future
class SubDataSet(StagingDataSet):
    purpose = IntField(choices=SUB_SET_PURPOSE, required=True)
    data = ListField(ReferenceField('StagingData'))
    parent_set = ReferenceField('StagingDataSet')