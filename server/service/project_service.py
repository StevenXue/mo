
from datetime import datetime
from business import project_business
from business import user_business


def get_projects_by_user_ID(user_ID):
    user = user_business.get_by_user_ID(user_ID)

