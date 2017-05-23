# -*- coding: UTF-8 -*-

from server.entity.project import Project
from server.repository.project_repo import ProjectRepo

project_repo = ProjectRepo(Project)


def create(project):
    print(project.name)
