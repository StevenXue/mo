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


class RequestAnswer(DynamicDocument):
    user_request_id = ReferenceField('UserRequest', reverse_delete_rule=CASCADE)
    answer = StringField()
    create_time = DateTimeField(required=True)
    edit_time = DateTimeField()
    answer_user_ID = StringField(required=True)
    votes_up_user = ListField(ReferenceField('User'))
    select_project = ReferenceField('Project')