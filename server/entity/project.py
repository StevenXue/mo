from mongoengine import *


class Project(Document):
    data_set = ReferenceField('DataSet')
    jobs = ListField(ReferenceField('Job'))
    result = ReferenceField('Result')
    ownership = ReferenceField('Ownership')
