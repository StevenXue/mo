# -*- coding: UTF-8 -*-
from bson import ObjectId
from business import project_business
from business import staging_data_set_business
from business import staging_data_business
from business import data_business


def list_staging_data_sets_by_project_id(project_id):
    sds_objects = staging_data_set_business.get_by_project_id(project_id)
    return [obj for obj in sds_objects]


def add_staging_data_set_by_data_set_id(sds_name, sds_description, project_id,
                                    data_set_id):
    # get project object
    project = project_business.get_by_id(project_id)
    print project.name
    # create new staging data set
    sds = staging_data_set_business.add(sds_name, sds_description, project)
    print sds.name
    # copy data from data(raw) to staging data
    data_objects = data_business.get_by_data_set(data_set_id)
    # data_objects = data_objects.to_json()
    print data_objects[0]
    # print type(data_objects)

    # try:
    # for data_obj in eval(data_objects):
    for data_obj in data_objects:
        # convert data_obj to SON format
        # data_obj_son_format = data_obj.to_mongo()
        # print data_obj_son_format

        # data_obj['data_set_id'] = data_obj['data_set']['$oid']
        # data_obj['data_id'] = data_obj['_id']['$oid']
        # data_obj.pop('_id')
        # data_obj.pop('data_set')

        # new_data_obj={}
        # for k, v in data_obj.iteritems():
        #     new_data_obj[k] = v

        # Add into staging_data collection
        # print data_obj
        staging_data_business.add(sds, data_obj.to_mongo())
    return sds
    # except Exception:
    #     staging_data_business.remove_by_staging_data_set_id(sds.id)
    #     staging_data_set_business.remove_by_id(sds.id)
    #     raise RuntimeError("Create staging data set failed")


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
