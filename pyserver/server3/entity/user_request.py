from mongoengine import DynamicDocument
from mongoengine import ListField
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import IntField

STATUS = (
    (0, 'open'),
    (100, 'closed'),
)


class UserRequest(DynamicDocument):
    title = StringField(max_length=50, required=True)
    description = StringField()
    create_time = DateTimeField(required=True)
    request_dataset = StringField()
    related_fields = ListField(StringField(max_length=100))
    tags = ListField(StringField(max_length=50))
    user_id = StringField(required=True)
    status = IntField(choices=STATUS, required=True)