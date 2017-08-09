# -*- coding: UTF-8 -*-

from mongoengine import Document
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import ReferenceField
from mongoengine import ListField
from mongoengine import PULL

# from server3.entity import DataSet
# from server3.entity import Job
# from server3.entity import Result


class Project(Document):
    name = StringField(max_length=50, required=True)
    description = StringField(max_length=140)
    create_time = DateTimeField(required=True)
    datasets = ListField(ReferenceField('DataSet', reverse_delete_rule=PULL))
    jobs = ListField(ReferenceField('Job', reverse_delete_rule=PULL))
    results = ListField(ReferenceField('Result', reverse_delete_rule=PULL))
    # if forked project, which project fork from
    source_project = ReferenceField('Project')
    user_name = StringField(max_length=50)
