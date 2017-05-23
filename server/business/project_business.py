# -*- coding: UTF-8 -*-

from server.entity.project import Project
from server.repository.project_repo import ProjectRepo

project_repo = ProjectRepo(Project)


def create(project):
    print(project.name)

def get_by_project_id(project_id):
    return project_repo.find_unique_one({'_id': project_id})
