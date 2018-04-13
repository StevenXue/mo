# -*- coding: UTF-8 -*-

from mongoengine import DynamicDocument
from mongoengine import BooleanField
from mongoengine import ReferenceField
from mongoengine import CASCADE

# from server3.entity import Toolkit
# from server3.entity import File
# from server3.entity import DataSet
# from server3.entity import Project
# from server3.entity import Model
# from server3.entity import User
from server3.entity.user_request import UserRequest
from server3.entity.comments import Comments
from server3.entity.request_answer import RequestAnswer
from server3.entity.message import Message

OWNERSHIP_LEVEL = ('public', 'private')


class Ownership(DynamicDocument):
    private = BooleanField(required=True)
    user = ReferenceField('User', required=True)
    project = ReferenceField('Project', reverse_delete_rule=CASCADE)
    data_set = ReferenceField('DataSet', reverse_delete_rule=CASCADE)
    model = ReferenceField('Model', reverse_delete_rule=CASCADE)
    toolkit = ReferenceField('Toolkit', reverse_delete_rule=CASCADE)
    file = ReferenceField('File', reverse_delete_rule=CASCADE)
    served_model = ReferenceField('ServedModel', reverse_delete_rule=CASCADE)
    user_request = ReferenceField('UserRequest', reverse_delete_rule=CASCADE)
    user_request_comments = ReferenceField('Comments',
                                           reverse_delete_rule=CASCADE)
    request_answer = ReferenceField('RequestAnswer',
                                    reverse_delete_rule=CASCADE)
