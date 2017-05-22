from mongoengine import *

from server.repository import file_repo


class File(Document):
    name = StringField(max_length=20, unique=True)
    description = StringField(max_length=50, unique=True)
    upload_time = DateTimeField()
    size = FloatField()
    path = StringField()
    user = ReferenceField('User')

    def add(self):
        return file_repo.create(self)

    def get_by_user(user):
        return file_repo.find_one({'user': user})

    def delete_by_object_id(self, object_id):
        file_obj = file_repo.find_one({'_id': object_id})
        return file_obj.delete()
