# -*- coding: UTF-8 -*-

from entity.project import Project
from repository.project_repo import ProjectRepo

project_repo = ProjectRepo(Project)


def create(project):
    return project_repo.create(project)


def get_by_id(object_id):
    project = Project(id=object_id)
    return project_repo.read_by_id(project)
