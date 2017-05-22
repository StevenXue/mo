from server.entity.file import File
from server.repository.file_repo import FileRepo

file_repo = FileRepo(File)


def add(file_obj):
    return file_repo.save_one(file_obj)


def get_by_user(user_obj):
    return file_repo.find_unique_one({'user': user_obj})


def delete_by_object_id(object_id):
    file_obj = file_repo.find_one({'_id': object_id})
    return file_obj.delete()
