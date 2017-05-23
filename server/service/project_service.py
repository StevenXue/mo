
from datetime import datetime
from business import project_business
from business import user_business

def get_projects_by_user_ID(user_ID):

    return project_repo.read_unique_one({'_id': project_id})
