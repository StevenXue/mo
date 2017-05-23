# -*- coding: UTF-8 -*-
import sys

from os import path

sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

from entity.project import Project
from business import project_business

from mongoengine import connect


from repository import config


connect(
    db=config.get_mongo_db(),
    username=config.get_mongo_user(),
    password=config.get_mongo_pass(),
    host=config.get_mongo_host(),
)

new_project = Project()
new_project.name = "test"

project_business.create(new_project)
