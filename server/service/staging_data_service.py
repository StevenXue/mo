# -*- coding: UTF-8 -*-
import sys
from bson import Code
from business import staging_data_set_business
from business import staging_data_business
from business import data_business
from utility import data_utility
from utility import json_utility

# import importlib

# 使得 sys.getdefaultencoding() 的值为 'utf-8'
# importlib.reload(sys)                      # reload 才能调用 setdefaultencoding 方法
reload(sys)
sys.setdefaultencoding('utf-8')  # 设置 'utf-8'


def find_by_query_str(staging_data_set_id, **kwargs):

    # query_str = dict(query_str_in_mongodb_form)
    # query_str['staging_data_set'] = staging_data_set_id
    kwargs['staging_data_set'] = staging_data_set_id
    return staging_data_business.get_by_query_str(**kwargs)


def list_staging_data_sets_by_project_id(project_id):
    """
    Get the list of staging_data_set by project id
    
    :param project_id: 
    :return: list of staging_data_set objects
    """
    sds_objects = staging_data_set_business.get_by_project_id(project_id)
    return [obj for obj in sds_objects]


def add_staging_data_set_by_data_set_id(sds_name, sds_description, project_id,
                                        data_set_id, f_t_arrays):
    """
    Create staging_data_set and copy to staging_data by original data_set id
        
    :param sds_name: str
    :param sds_description: str 
    :param project_id: ObjectId
    :param data_set_id: ObjectId
    :param f_t_arrays: array: [['name', 'str'],['age', 'int'], ['salary',
    'float']]
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
        # convert mongoengine objects to dicts
        data_objects = json_utility.me_obj_list_to_dict_list(data_objects)
        # convert types of values in dicts
        result = data_utility.convert_data_array_by_fields(data_objects,
                                                           f_t_arrays)
        data_objects = result['result']
        # add to staging data set
        for data_obj in data_objects:
            # create staging_data object
            staging_data_business.add(sds, data_obj)
        if 'failure_count' in result:
            failure_count = result['failure_count']
            return {'result': sds, 'failure_count': failure_count}
        return {'result': sds}
    except Exception:
        # remove staging_data_set and staging_data
        staging_data_business.remove_by_staging_data_set_id(sds.id)
        staging_data_set_business.remove_by_id(sds.id)
        raise RuntimeError("Create staging data set failed")


def get_fields_with_types(staging_data_set_id):
    """
    Get the fields and its types of one staging_data_set by map/reduce function.
    :param staging_data_set_id:
    :return: [field_name, [type1, type2, ...]]
    """
    mapper = Code("""
        function() {
            for (var key in this) { emit(key, typeof this[key]); }
            //for (var key in this) { emit(key, null); }
        }
    """)

    reducer = Code("""
        function(key, stuff) { 
        let obj = {}
        stuff.forEach(e => obj[e] = null)
        return obj; 
        }
    """)
    result = staging_data_business.\
        get_fields_by_map_reduce(staging_data_set_id, mapper, reducer)
    # result = StagingData.objects(ListingId='126541').map_reduce(mapper, reducer, 'inline')
    # print isinstance(result, MapReduceDocument)
    # print len(list(result))
    return [[mr_doc.key, mr_doc.value.keys()] for mr_doc in result]
    # for mr_doc in result:
    #     print mr_doc.key, mr_doc.value


def _get_fields_with_types(staging_data_set_id):
    """
    Get the fields and its types of one staging_data_set
        
    :param staging_data_set_id: 
    :return: the list of field name and value type 
    """
    # sds_object = staging_data_set_business.get_by_id(staging_data_set_id)
    # sd_object = staging_data_business.get_first_one_by_staging_data_set(
    #              sds_object)
    sd_object = staging_data_business.get_first_one_by_staging_data_set_id(
        staging_data_set_id)

    if sd_object:
        transformed_sb_object = sd_object.to_mongo().to_dict()
        return [[k, type(v).__name__]for k, v
                in transformed_sb_object.iteritems()]
    else:
        raise RuntimeError("No matched data")


