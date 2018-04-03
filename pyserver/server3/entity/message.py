from mongoengine import DynamicDocument
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import ReferenceField
from mongoengine import CASCADE
from mongoengine import BooleanField
from mongoengine import ListField


MESSAGE_TYPE = ('answer', 'chat', 'commit', 'deploy', 'publish')


class Message(DynamicDocument):
    create_time = DateTimeField(required=True)
    sender = ReferenceField("User", reverse_delete_rule=CASCADE, required=True)
    title = StringField()
    message_type = StringField(max_length=100, choices=MESSAGE_TYPE, required=True)
    content = StringField()
    # receivers = ListField(ReferenceField(Receiver))
    user = ReferenceField("User", reverse_delete_rule=CASCADE)
    user_request = ReferenceField("UserRequest", reverse_delete_rule=CASCADE)


class Receiver(DynamicDocument):
    read_time = DateTimeField()
    user = ReferenceField("User", required=True)
    is_read = BooleanField(default=False)
    message = ReferenceField("Message", required=True,
                             reverse_delete_rule=CASCADE)



