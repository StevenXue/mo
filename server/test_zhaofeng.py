# -*- coding: UTF-8 -*-
from mongoengine import connect

from repository import config

from service import ownership_service
from entity.project import Project
from entity.file import File

connect(
    db=config.get_mongo_db(),
    username=config.get_mongo_user(),
    password=config.get_mongo_pass(),
    host=config.get_mongo_host(),
)


print ownership_service.list_by_user_ID('tttt')
