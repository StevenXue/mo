
from datetime import datetime
from business import project_business, user_business, ownership_business
from service import ownership_service
from entity.project import Project
from datetime import datetime


def get_projects_by_user_ID(user_ID):
    user = user_business.get_by_user_ID(user_ID)
    ownerships = ownership_service.list_by_user_ID(user_ID)
    return [os.project for os in ownerships if 'project' in os]


def create_project(name, description, user_ID, is_private):
    '''
    '''
    # create a new project object
    new_project = Project()
    new_project.name = name
    new_project.description = description
    new_project.create_time = datetime.utcnow()
    created_project = project_business.create(new_project)
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
