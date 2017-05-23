# -*- coding: UTF-8 -*-

from mongoengine import connect
from entity.project import Project
from business import project_business
from repository import config


connect(
    db=config.get_mongo_db(),
    username=config.get_mongo_user(),
    password=config.get_mongo_pass(),
    host=config.get_mongo_host(),
)

new_project = Project()
new_project.name = "bbb"

project_business.create(new_project)
