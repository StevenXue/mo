# -*- coding: UTF-8 -*-

from entity.project import Project
from repository.project_repo import ProjectRepo

project_repo = ProjectRepo(Project)


def add(name, description, create_time):
    project_obj = Project(name=name, description=description,
                          create_time=create_time)
    return project_repo.create(project_obj)


def get_by_id(object_id):
    project = Project(id=object_id)
    return project_repo.read_by_id(project)
