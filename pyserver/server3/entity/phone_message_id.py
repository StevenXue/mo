from mongoengine import DynamicDocument
from mongoengine import StringField


class PhoneMessageId(DynamicDocument):
    phone = StringField(max_length=11, unique=True, sparse=True)
    msg_id = StringField()
