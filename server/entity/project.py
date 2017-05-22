from mongoengine import *


class Project(Document):
    data_set = ReferenceField('DataSet')
    job = ReferenceField('Job')
    result = ReferenceField('Result')
    ownership = ReferenceField('Ownership')
