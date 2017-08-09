# -*- coding: UTF-8 -*-
import sys
from copy import deepcopy

from bson import Code
import numpy as np
import pandas as pd
from mongoengine import DoesNotExist

from server3.business import staging_data_set_business
from server3.business import staging_data_business
from server3.business import data_business
from server3.business import data_set_business
from server3.service import data_service
from server3.utility import data_utility
from server3.utility import json_utility
from server3 import constants

DEFAULT_RATIO = 0.5


def get_by_query_str(staging_data_set_id, **kwargs):
    # query_str = dict(query_str_in_mongodb_form)
    # query_str['staging_data_set'] = staging_data_set_id
    kwargs['staging_data_set'] = staging_data_set_id
    return staging_data_business.get_by_query_str(**kwargs)


def list_staging_data_sets_by_project_id(project_id, without_result=False):
    """
    Get the list of staging_data_set by project id
    
    :param project_id: 
    :param without_result:
    :return: list of staging_data_set objects
    """
    sds_objects = staging_data_set_business.get_by_project_id(
        project_id, without_result)
    return sds_objects


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
    ds = data_set_business.get_by_id(data_set_id).to_mongo()
    ds.pop('name')
    ds.pop('description')
    sds = staging_data_set_business.add(sds_name, sds_description, project_id,
                                        **ds)
    # copy data from data(raw) to staging data
    # get all data objects by data_set id
    try:
        data_objects = data_business.get_by_data_set(data_set_id)
        # convert mongoengine objects to dicts
        data_objects = json_utility.me_obj_list_to_dict_list(data_objects)

        # remove data set id when import to sds
        for d in data_objects:
            d.pop('data_set')

        staging_data_business.add_many(sds, data_objects)
        return sds
    except Exception:
        # remove staging_data_set and staging_data
        staging_data_business.remove_by_staging_data_set_id(sds.id)
        staging_data_set_business.remove_by_id(sds.id)
        raise RuntimeError("Create staging data set failed")


def convert_fields_type(sds_id, f_t_arrays):
    """
    convert field types of staging data set
    :param sds_id: ObjectId
    :param f_t_arrays: array: [['name', 'str'],['age', 'int'], ['salary',
    'float']]
    :return: new staging_data_set object
    """
    # get project object
    # project = project_business.get_by_id(project_id)

    # create new staging data set
    sds = staging_data_set_business.get_by_id(sds_id)
    # copy data from data(raw) to staging data
    # get all data objects by data_set id

    data_objects = staging_data_business. \
        get_by_staging_data_set_id(sds['id'])
    # convert mongoengine objects to dicts
    data_objects = json_utility.me_obj_list_to_dict_list(data_objects)
    # convert types of values in dicts
    result = data_utility.convert_data_array_by_fields(data_objects,
                                                       f_t_arrays)
    data_objects = result['result']

    # update all rows
    for data_obj in data_objects:
        staging_data_business.update_by_id(data_obj['_id'], data_obj)

    if 'failure_count' in result:
        failure_count = result['failure_count']
        return {'result': sds, 'failure_count': failure_count}
    return {'result': sds}


def get_fields_with_types(staging_data_set_id):
    """
    Get the fields and its types of one staging_data_set by map/reduce function.
    :param staging_data_set_id:
    :return: [field_name, [type1, type2, ...]]
    """
    mapper, reducer = data_service.field_mapper_reducer()
    result = staging_data_business. \
        get_fields_by_map_reduce(staging_data_set_id, mapper, reducer)
    # result = StagingData.objects(ListingId='126541').map_reduce(mapper, reducer, 'inline')
    # print isinstance(result, MapReduceDocument)
    return [[mr_doc.key, list(mr_doc.value.keys())] for mr_doc in result]
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
        return [[k, type(v).__name__] for k, v
                in transformed_sb_object.items()]
    else:
        raise RuntimeError("No matched data")


def check_integrity(staging_data_set_id):
    """
    check_integrity
    :param staging_data_set_id:
    :return:
    """
    data_objects = staging_data_business. \
        get_by_staging_data_set_id(staging_data_set_id)
    # convert mongoengine objects to dicts
    data_objects = json_utility.me_obj_list_to_json_list(data_objects)
    data_fields = get_fields_with_types(staging_data_set_id)
    return data_service.check_data_integrity(data_objects, data_fields)


def update_data(update):
    """
    update data row by row
    :param update:
    :return:
    """
    for oid in update.keys():
        query = {}
        for q in update[oid]:
            query.update(q)
        staging_data_business.update_by_id(oid, query)


# 新增加一个栏位用来加字段，字段的value在array里面
def add_new_key_value(sds_id, key, array):
    """
        update data row by row
        :param update:
        :return:
    """
    # get staging data的所有id
    ids = staging_data_business.get_by_staging_data_set_id(sds_id)
    for oid in ids:
        query = {key: array.copy().pop(0)}
        staging_data_business.update_by_id(oid.id, query)


# 新增多个栏位用来加字段，字段的value和key在dict里面
def add_new_keys_value(sds_id, lst_dicts):
    """
        update data row by row
        :param update:
        :return:
    """
    # get staging data的所有id
    ids = staging_data_business.get_by_staging_data_set_id(sds_id)
    for oid in ids:
        staging_data_business.update_by_id(oid.id, lst_dicts.pop(0))

def get_row_col_info(sds_id):
    """
    get_row_col_info
    :param sds_id:
    :return:
    """
    sds = staging_data_business.get_by_staging_data_set_id(sds_id)
    row_n = len(sds)
    col_n = len(get_fields_with_types(sds_id))
    return {'row': row_n, 'col': col_n}


def remove_staging_data_set_by_id(sds_id):
    """
    remove_staging_data_set_by_id
    :param sds_id:
    :return:
    """
    staging_data_business.remove_by_staging_data_set_id(sds_id)
    return staging_data_set_business.remove_by_id(sds_id)


def mongo_to_array(cursor, fields):
    """
    mongo data to ndarray
    :param cursor:
    :param fields:
    :return:
    """
    arrays = convert_array(cursor, fields)
    arrays = np.array(arrays)
    return arrays


def convert_array(data, columns):
    data_array = []
    for item in data:
        temp = [data_utility.convert_string_to_number_with_poss(item[i])
                for i in columns
                if item[i] != '_id' and item[i] != 'staging_data_set']
        data_array.append(temp)
    return data_array


def mongo_to_df(cursor):
    """
    mongo data to data frame
    :param cursor:
    :return:
    """
    cursor = json_utility.me_obj_list_to_dict_list(cursor)
    return pd.DataFrame.from_records(cursor)


def split_x_y(sds_id, x_fields, y_fields):
    """
    split data to x and y

    :param sds_id:
    :param x_fields:
    :param y_fields:
    :return:
    """
    data = staging_data_business. \
        get_by_staging_data_set_and_fields(sds_id,
                                           x_fields + y_fields,
                                           allow_nan=False)
    x = mongo_to_array(data, x_fields)
    y = mongo_to_array(data, y_fields)
    return {'x': x, 'y': y}


def split_test_train(x_y_obj, schema='cv', **kwargs):
    """
    split data to test and train
    :param x_y_obj:
    :param schema:
    :return:
    """
    x = x_y_obj.pop('x', np.array([]))
    y = x_y_obj.pop('y', np.array([]))
    ratio = kwargs.get('ratio')
    divide_row = kwargs.get('divide_row')
    if schema == 'cv':
        ratio = ratio or DEFAULT_RATIO
        x_tr, x_te, y_tr, y_te = \
            data_utility.k_fold_cross_validation(x, y, float(ratio))
        return {'x_tr': x_tr, 'y_tr': y_tr, 'x_te': x_te, 'y_te': y_te}
    if schema == 'seq':
        if not divide_row and ratio:
            ratio = float(ratio)
            divide_row = x.shape[0] * ratio
        else:
            divide_row = divide_row or x.shape[0] * DEFAULT_RATIO
        divide_row = int(divide_row)
        return {'x_tr': x[:divide_row, :], 'y_tr': y[:divide_row, :],
                'x_te': x[divide_row:, :], 'y_te': y[divide_row:, :]}
    if schema == 'rand':
        pass
        # if ratio and not trl:
        #     trl = x.shape[0] * ratio
        # if trl:
        #     return {'x_tr': x[:trl], 'y_tr': y[:trl],
        #             'x_te': x[trl:], 'y_te': y[trl:]}
        # raise NameError('arg error')


def copy_staging_data_set(sds, belonged_project, **kwargs):
    """
    copy_staging_data_set
    :param sds:
    :param belonged_project:
    :return:
    """
    try:
        staging_data_set_business.get_by_name_and_project(
            sds.name, belonged_project)
    except DoesNotExist:
        belonged_job = None
        if 'belonged_job' in kwargs:
            belonged_job = kwargs.pop('belonged_job')
        if kwargs:
            raise TypeError('Unrecognized keyword arguments: ' + str(kwargs))
        sds_cp = staging_data_set_business.copy_staging_data_set(
            sds, belonged_project, belonged_job)
        staging_data_business.copy_staging_data_by_staging_data_set_id(sds_cp)
        return sds_cp
