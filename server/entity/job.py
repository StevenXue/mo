from mongoengine import *

STATUS = (
    (0, 'start'),
    (1, 'process'),
    (2, 'end')
)


class Job(Document):
    model = ReferenceField('Model')
    toolkit = ReferenceField('ToolKit')
    temp = ReferenceField('Temp')
    status = IntField(choices=STATUS, required=True)
