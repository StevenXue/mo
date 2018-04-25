from mongoengine import DynamicDocument
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import ReferenceField
from mongoengine import CASCADE
from mongoengine import IntField
from server3.entity.request_answer import RequestAnswer

COMMENT_TYPE = ('request', 'answer', 'project')


class Comments(DynamicDocument):

    request = ReferenceField('UserRequest', reverse_delete_rule=CASCADE)
    answer = ReferenceField('RequestAnswer', reverse_delete_rule=CASCADE)
    project = ReferenceField('Project', reverse_delete_rule=CASCADE)

    # comments_user_ID = StringField(required=True)
    comments_user = ReferenceField('User', reverse_delete_rule=CASCADE)

    create_time = DateTimeField(required=True)
    comments = StringField(required=True)

    update_time = DateTimeField()
    # reply_number = IntField(default=0)

    # comments_type = StringField(max_length=100, choices=COMMENT_TYPE)

