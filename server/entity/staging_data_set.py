from mongoengine import *

STAGES = ('input', 'training', 'testing')


class StagingDataSet(Document):
    stage = StringField(required=True, choices=STAGES)
    source_data_sets = ListField(ReferenceField(''))


