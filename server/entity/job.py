from mongoengine import *

STATUS = (
    (0, 'start'),
    (1, 'process'),
    (2, 'end')
)


class Job(Document):
    model = ReferenceField('Model')
    toolkit = ReferenceField('ToolKit')
    staging_data_set = ReferenceField('StagingDataSet')
    status = IntField(choices=STATUS, required=True)
