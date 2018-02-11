# -*- coding: UTF-8 -*-

from mongoengine import DynamicDocument
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import ReferenceField
from mongoengine import ListField
from mongoengine import PULL


class Project(DynamicDocument):
    # required
    name = StringField(max_length=50, required=True)
    description = StringField(max_length=140)
    create_time = DateTimeField(required=True)
    update_time = DateTimeField(required=True)
    type = StringField(choices=('app', 'module', 'dataset'), required=True)

    # optional
    datasets = ListField(ReferenceField('DataSet', reverse_delete_rule=PULL))
    jobs = ListField(ReferenceField('Job', reverse_delete_rule=PULL))
    # if forked project, which project fork from
    source_project = ReferenceField('Project')
    tags = ListField(StringField(max_length=50))

    # deprecated
    related_tasks = ListField(StringField(max_length=50))
    related_fields = ListField(StringField(max_length=100))
    user_name = StringField(max_length=50)
    results = ListField(ReferenceField('Result', reverse_delete_rule=PULL))
