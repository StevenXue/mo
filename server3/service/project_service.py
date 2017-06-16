# -*- coding: UTF-8 -*-
from datetime import datetime

from business import project_business
from business import user_business
from business import ownership_business
from business import data_set_business
from service import ownership_service


def create_project(name, description, user_ID, is_private):
    """
    Create a new project

    :param name: str
    :param description: str
    :param user_ID: ObjectId
    :param is_private: boolean
    :return: a new created project object
    """

    # create a new project object
    created_project = project_business.add(name, description, datetime.utcnow())
    if created_project:
        # create project successfully

        # get user object
        user = user_business.get_by_user_ID(user_ID)

        # create ownership relation
        if ownership_business.add(user, is_private, project=created_project):
            return created_project
        else:
            raise RuntimeError('Cannot create ownership of the new project')
    else:
        raise RuntimeError('Cannot create the new project')


def list_projects_by_user_ID(user_ID):
    if not user_ID:
        raise ValueError('no user id')
    public_projects = ownership_service.get_all_public_objects('project')
    owned_projects = ownership_service.\
        get_private_ownership_objects_by_user_ID(user_ID, 'project')
    return public_projects, owned_projects


def remove_project_by_id(project_id):
    return project_business.remove_by_id(project_id)
