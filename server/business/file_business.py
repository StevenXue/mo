# -*- coding: UTF-8 -*-

from entity.file import File
from repository.file_repo import FileRepo

file_repo = FileRepo(File)


def add(file_name, file_size, url, path):
    file_obj = File(name=file_name, size=file_size, url=url, path=path)
    return file_repo.create(file_obj)


def list_by_user(user_obj):
    file_obj = File(user=user_obj)
    return file_repo.read_by_user(file_obj)


def get_by_id(file_id):
    file_obj = File(id=file_id)
    return file_repo.read_by_id(file_obj)


def delete_by_id(file_id):
    file_obj = File(id=file_id)
    return file_repo.delete_by_id(file_obj)


def get_raw_file(file):
    path = file.path

