# -*- coding: UTF-8 -*-

from business import project_business
from business import staging_data_set_business, staging_data_business
from entity.data import Data
# from utility import json_utility


def add_staging_data_set(sds_name, sds_description, project_id,
                         data_objects):
    # get project object
    project = project_business.get_by_id(project_id)

    # create new staging data set
    sds = staging_data_set_business.add(sds_name, sds_description, project)

    # copy data from data(raw) to staging data
    try:
        for data_obj in data_objects:
            # data_obj = data_obj.to_mongo().to_dict()
            data_obj = data_obj.to_mongo()
            # print data_obj
            staging_data_business.add(sds, data_obj)
    except Exception as e:
        staging_data_set_business.remove_by_id(sds.id)
        raise RuntimeError("Create staging data set failed")




