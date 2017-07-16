# -*- coding: UTF-8 -*-
import math
from bson import Code
from bson import ObjectId

from server3.business import data_business
from server3.business import data_set_business
from server3.business import ownership_business
from server3.business import user_business
from server3.service import file_service
from server3.service import ownership_service
from server3.utility import json_utility
from server3 import constants


def field_mapper_reducer():
    mapper = Code("""
            function() {
                function isInt(n) {
                    return n % 1 === 0;
                }
                for (var key in this) {
                    let type = typeof this[key]
                    if(type === 'number') {
                        if(isInt(this[key])) {
                            type = 'integer'
                        } else {
                            type = 'float'
                        }
                    }
                    emit(key, type); 
                }
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
    return mapper, reducer


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
    new_data_array = []
    for data in data_array:
        # id field will conflict with object_id
        if 'id' in data:
            data['id_1'] = data.pop('id')
        if '_id' in data:
            data['_id_1'] = data.pop('_id')

        data = {key.replace('.', '_'): value for key, value in data.items()}

        new_data_array.append(data)

    data_business.add_many(ds, new_data_array)
    return ds


def import_data_from_file_id(file_id, data_set_name, ds_description, user_ID,
                             is_private, **kwargs):
    table = file_service.file_loader(file_id, user_ID, **kwargs)
    return import_data(table, data_set_name, ds_description, user_ID,
                       is_private)


def list_data_sets_by_user_ID(user_ID, order=-1):
    if not user_ID:
        raise ValueError('no user id')
    public_ds = ownership_service.get_all_public_objects('data_set')
    owned_ds = ownership_service.\
        get_private_ownership_objects_by_user_ID(user_ID, 'data_set')

    if order == -1:
        public_ds.reverse()
        owned_ds.reverse()
    return public_ds, owned_ds


def get_fields_with_types(data_set_id):
    """
    Get the fields and its types of one staging_data_set by map/reduce function.
    :param data_set_id:
    :return: [field_name, [type1, type2, ...]]
    """
    mapper, reducer = field_mapper_reducer()
    result = data_business. \
        get_fields_by_map_reduce(data_set_id, mapper, reducer)
    # result = StagingData.objects(ListingId='126541').map_reduce(mapper, reducer, 'inline')
    # print isinstance(result, MapReduceDocument)
    # print len(list(result))
    return [[mr_doc.key, list(mr_doc.value.keys())] for mr_doc in result]
    # for mr_doc in result:
    #     print mr_doc.key, mr_doc.value


def check_data_set_integrity(data_set_id):
    data_objects = data_business.get_by_data_set(data_set_id)
    # convert mongoengine objects to dicts
    data_objects = json_utility.me_obj_list_to_json_list(data_objects)
    data_fields = get_fields_with_types(data_set_id)
    return check_data_integrity(data_objects, data_fields)


def check_data_integrity(data_array, data_fields):
    missing = {}
    for row in data_array:
        oid = row['_id']
        for field in data_fields:
            if field[0] not in row or row[field[0]] == '' \
                    or row[field[0]] == ' ' or row[field[0]] is None:
                if oid in missing:
                    missing[oid].append({field[0]: ''})
                else:
                    missing[oid] = [{field[0]: ''}]
                row[field[0]] = constants.FILL_BLANK
    # return missing
    return {'missing': missing, 'data_array_filled': data_array}


def update_data(update):
    for oid in update.keys():
        query = {}
        for q in update[oid]:
            query.update(q)
        data_business.update_by_id(oid, query)


def remove_data_set_by_id(data_set_id):
    data_business.remove_data_by_data_set_id(data_set_id)
    return data_set_business.remove_by_id(data_set_id)
