from mongoengine import DynamicDocument
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import ReferenceField
from mongoengine import CASCADE
from mongoengine import IntField
from server3.entity.request_answer import RequestAnswer

COMMENT_TYPE = ('request', 'answer')


class UserRequestComments(DynamicDocument):
    user_request = ReferenceField('UserRequest', reverse_delete_rule=CASCADE)
    request_answer = ReferenceField('RequestAnswer', reverse_delete_rule=CASCADE)
    create_time = DateTimeField(required=True)
    comments_user_ID = StringField(required=True)
    comments = StringField(required=True)
    reply_number = IntField(default=0)
    comments_type = StringField(max_length=100, choices=COMMENT_TYPE)

