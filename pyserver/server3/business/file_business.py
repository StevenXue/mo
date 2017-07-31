# -*- coding: UTF-8 -*-
from datetime import datetime
from server3.entity.file import File
from server3.repository.file_repo import FileRepo

file_repo = FileRepo(File)


def add(file_name, file_size, url, uri, description, extension, type):
    file_obj = File(name=file_name, size=file_size, url=url, uri=uri,
                    upload_time=datetime.utcnow(), description=description,
                    extension=extension, type=type)
    return file_repo.create(file_obj)


def get_by_user(user_obj):
    return file_repo.read_by_unique_field('user', user_obj)


def get_by_id(file_id):
    return file_repo.read_by_id(file_id)


def remove_by_id(file_id):
    return file_repo.delete_by_id(file_id)


