# -*- coding: UTF-8 -*-
import sys
from business import project_business
from business import staging_data_set_business
from business import staging_data_business
from business import data_business

# 使得 sys.getdefaultencoding() 的值为 'utf-8'
reload(sys)                      # reload 才能调用 setdefaultencoding 方法
sys.setdefaultencoding('utf-8')  # 设置 'utf-8'


def list_staging_data_sets_by_project_id(project_id):
    """
    get the list of staging_data_set by project id
    
    :param project_id: 
    :return: list of staging_data_set objects
    """
    sds_objects = staging_data_set_business.get_by_project_id(project_id)
    return [obj for obj in sds_objects]


def add_staging_data_set_by_data_set_id(sds_name, sds_description, project_id,
                                        data_set_id):
    """
    Create staging_data_set and copy to staging_data by original data_set id
        
    :param sds_name: str
    :param sds_description: str 
    :param project_id: ObjectId
    :param data_set_id: ObjectId
    :return: new staging_data_set object
    """
    # get project object
    # project = project_business.get_by_id(project_id)

    # create new staging data set
    sds = staging_data_set_business.add(sds_name, sds_description, project_id)

    # copy data from data(raw) to staging data
    # get all data objects by data_set id
    try:
        data_objects = data_business.get_by_data_set(data_set_id)
        for data_obj in data_objects:
            # create staging_data object
            staging_data_business.add(sds, data_obj.to_mongo())
        return sds
    except Exception:
        # remove staging_data_set and staging_data
        staging_data_business.remove_by_staging_data_set_id(sds.id)
        staging_data_set_business.remove_by_id(sds.id)
        raise RuntimeError("Create staging data set failed")


def get_fields_with_types(staging_data_set_id):
    """
    Get the fields and its types of one staging_data_set
        
    :param staging_data_set_id: 
    :return: the list of field name and value type 
    """
    sds_object = staging_data_set_business.get_by_id(staging_data_set_id)
    sd_object = staging_data_business.get_first_one_by_staging_data_set(
                 sds_object)
    sd_object = sd_object.to_mongo().to_dict()
    return [[k, type(v).__name__]for k, v in sd_object.iteritems()]


