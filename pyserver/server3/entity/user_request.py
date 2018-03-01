from mongoengine import DynamicDocument
from mongoengine import ListField
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import IntField
from mongoengine import ReferenceField
from mongoengine import CASCADE

STATUS = (
    (0, 'open'),
    (100, 'closed'),
)

RELATED_FIELDS = ('Business', 'Government', 'Education', 'Environment',
                  'Health', 'Housing & Development', 'Public Services',
                  'Social', 'Transportation', 'Science', 'Technology')

VALID_TYPE = ('app', 'module', 'dataset')


class UserRequest(DynamicDocument):
    title = StringField(max_length=200, required=True)
    type = StringField(choices=VALID_TYPE, required=True)
    category = ListField(StringField(max_length=100))
    description = StringField()
    create_time = DateTimeField(required=True)
    request_dataset = StringField()
    tags = ListField(StringField(max_length=50))
    user = ReferenceField('User')
    status = IntField(choices=STATUS, required=True)
    accept_answer = ReferenceField('RequestAnswer')
    input = StringField()
    output = StringField()
    votes_up_user = ListField(ReferenceField('User'))
    star_user = ListField(ReferenceField('User'))
