# -*- coding: UTF-8 -*-

from mongoengine import connect
from entity.project import Project
from business import project_business
from service import project_service
from repository import config


connect(
    db=config.get_mongo_db(),
    username=config.get_mongo_user(),
    password=config.get_mongo_pass(),
    host=config.get_mongo_host(),
)

# project_service.create_project("testasdfasdf", "adsfafd",
#    'test_user', True)

print project_service.get_projects_by_user_ID('test_user')
