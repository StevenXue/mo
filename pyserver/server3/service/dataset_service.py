# -*- coding: UTF-8 -*-
import os

from server3.service.project_service import ProjectService
from server3.business.module_business import ModuleBusiness
from server3.business.data_set_business import DatasetBusiness
from server3.constants import MODULE_DIR


class DatasetService(ProjectService):
    business = DatasetBusiness


if __name__ == '__main__':
    pass
