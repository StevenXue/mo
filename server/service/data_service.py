# -*- coding: UTF-8 -*-
from mongoengine import *
from bson import Code

from business import data_business
from business import data_set_business
from business import ownership_business
from business import user_business
from service import file_service
from service import ownership_service


def add_data_set(data_set_name, ds_description, user_ID, is_private):
    ds = data_set_business.add(data_set_name, ds_description)
    user = user_business.get_by_user_ID(user_ID)
    os = ownership_business.add(user, is_private, data_set=ds)
    return ds


def import_data(data_array, data_set_name, ds_description, user_ID, is_private):
    # find data set, if not exists add new one
    # try:
    #     ds = data_set_business.get_by_name(data_set_name)
    # except DoesNotExist:
    ds = add_data_set(data_set_name, ds_description, user_ID, is_private)
    for data in data_array:
        # print data, '\n'
        # id field will conflict with object_id
        if 'id' in data:
            data['id_1'] = data['id']
            data.pop('id')
        if '_id' in data:
            data['_id_1'] = data['id']
            data.pop('_id')
        data_business.add(ds, data)
    return ds


def import_data_from_file_id(file_id, data_set_name, ds_description, user_ID,
                             is_private):
    table = file_service.file_loader(file_id, user_ID)
    return import_data(table, data_set_name, ds_description, user_ID,
                       is_private)


def list_data_sets_by_user_ID(user_ID):
    if not user_ID:
        raise ValueError('no user id')
    public_ds = ownership_service.get_all_public_objects('data_set')
    owned_ds = ownership_service.get_ownership_objects_by_user_ID(user_ID,
                                                                     'data_set')
    return public_ds, owned_ds


def get_fields_with_types(data_set_id):
    """
    Get the fields and its types of one staging_data_set by map/reduce function.
    :param data_set_id:
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
    result = data_business. \
        get_fields_by_map_reduce(data_set_id, mapper, reducer)
    # result = StagingData.objects(ListingId='126541').map_reduce(mapper, reducer, 'inline')
    # print isinstance(result, MapReduceDocument)
    # print len(list(result))
    return [[mr_doc.key, mr_doc.value.keys()] for mr_doc in result]
    # for mr_doc in result:
    #     print mr_doc.key, mr_doc.value


def remove_data_set_by_id(data_set_id):
    data_set
    # remove data set
    data_set_business.remove_by_id(data_set_id)
