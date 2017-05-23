# -*- coding: UTF-8 -*-
import sys

from os import path

sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

from server.entity.project import Project
from server.business import project_business

from mongoengine import connect


from server.repository import config


connect(
    db=config.get_mongo_db(),
    username=config.get_mongo_user(),
    password=config.get_mongo_pass(),
    host=config.get_mongo_host(),
)

new_project = Project()
new_project.name = "test"

project_business.create(new_project)
