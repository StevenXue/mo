# -*- coding: UTF-8 -*-
from bson import ObjectId
from business import project_business
from business import staging_data_set_business
from business import staging_data_business
from business import data_business


def list_staging_data_sets_by_project_id(project_id):
    sds_objects = staging_data_set_business.get_by_project_id(project_id)
    return [obj for obj in sds_objects]


def add_staging_data_set_by_objects(sds_name, sds_description, project_id,
                                    data_set_id):
    # get project object
    project = project_business.get_by_id(project_id)

    # create new staging data set
    sds = staging_data_set_business.add(sds_name, sds_description, project)

    # copy data from data(raw) to staging data
    data_objects = data_business.get_by_data_set(data_set_id)
    try:
        for data_obj in data_objects:
            # convert data_obj to SON format
            data_obj_son_format = data_obj.to_mongo()

            # Add into staging_data collection
            staging_data_business.add(sds, data_obj_son_format)
    except Exception:
        staging_data_set_business.remove_by_id(sds.id)
        raise RuntimeError("Create staging data set failed")


def get_fields_with_types(staging_data_set_id):
    """
    
    :param staging_data_set_id: 
    :return: the list of field name and value type 
    """
    sds_object = staging_data_set_business.get_by_id(staging_data_set_id)
    sd_object = staging_data_business.get_first_one_by_staging_data_set(
                 sds_object)
    sd_object = sd_object.to_mongo().to_dict()
    return [[k, type(v).__name__]for k, v in sd_object.iteritems()]




# def get_by_staging_data_set_id_and_fields(staging_data_set_id, fields):
#     return staging_data_business.get_by_staging_data_set_and_fields(
#         staging_data_set_id, fields)
