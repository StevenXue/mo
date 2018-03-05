# -*- coding: UTF-8 -*-

from mongoengine import DynamicDocument
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import ReferenceField
from mongoengine import ListField
from mongoengine import DictField
from mongoengine import IntField
from mongoengine import PULL


class Project(DynamicDocument):
    # required
    name = StringField(max_length=50, required=True)
    create_time = DateTimeField(required=True)
    update_time = DateTimeField(required=True)
    type = StringField(choices=('app', 'module', 'dataset'), required=True)
    hub_token = StringField(required=True)
    path = StringField(required=True)
    user = ReferenceField("User", required=True)
    privacy = StringField(choices=['private', 'public'], required=True)

    # optional
    description = StringField(max_length=140)
    tb_port = StringField()
    datasets = ListField(ReferenceField('DataSet', reverse_delete_rule=PULL))
    jobs = ListField(ReferenceField('Job', reverse_delete_rule=PULL))
    # if forked project, which project fork from
    source_project = ReferenceField('Project')
    tags = ListField(StringField(max_length=50))
    favor_users = ListField(ReferenceField("User"))
    star_users = ListField(ReferenceField("User"))

    # deprecated
    related_tasks = ListField(StringField(max_length=50))
    related_fields = ListField(StringField(max_length=100))
    user_name = StringField(max_length=50)
    results = ListField(ReferenceField('Result', reverse_delete_rule=PULL))

    meta = {
        'allow_inheritance': True,
        'indexes': [
            {'fields': ['$name', '$description', '$path'],
             'default_language': "english",
             'weights': {'name': 10, 'description': 5, 'path': 5}
             }
        ]}


class Dataset(Project):
    size = IntField()  # by bytes


class Module(Project):
    category = StringField(choices=('model', 'toolkit'))
    module_path = StringField()
    input = DictField()
    output = DictField()


RE_TYPE = (
    (0, 'disabled'),
    (1, 'active')
)


class App(Project):
    url = StringField(max_length=50)
    app_path = StringField()
    used_modules = ListField(ReferenceField(Module))
    keyword = StringField(max_length=30)
    input = DictField()
    output = DictField()
    status = IntField(choices=RE_TYPE)
