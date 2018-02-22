# -*- coding: UTF-8 -*-
import uuid
import datetime

from server3.entity import project
from server3.business.project_business import ProjectBusiness
from server3.repository.general_repo import Repo


class AppBusiness(ProjectBusiness):
    repo = Repo(project.App)

