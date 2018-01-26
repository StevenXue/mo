from mongoengine import DynamicDocument
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import ReferenceField
from mongoengine import CASCADE


class UserRequestComments(DynamicDocument):
    user_request_id = ReferenceField('UserRequest', reverse_delete_rule=CASCADE)
    create_time = DateTimeField(required=True)
    comments_user_id = StringField(required=True)
    comments = StringField(required=True)
