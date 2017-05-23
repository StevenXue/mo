# -*- coding: UTF-8 -*-

from entity.project import Project
from repository.project_repo import ProjectRepo

project_repo = ProjectRepo(Project)


def create(project):
    print(project.name)
