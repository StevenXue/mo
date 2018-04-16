# -*- coding: UTF-8 -*-
import math
import os
from bson import Code
from bson import ObjectId

from server3.business import data_business
from server3.business import data_set_business
from server3.business import ownership_business
from server3.business import file_business
from server3.service import file_service
from server3.service import ownership_service
from server3.utility import json_utility
from server3.utility import data_utility
from server3.repository import config
from server3 import constants
from server3.business.user_business import UserBusiness

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')


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
                    emit(key, [type, this[key]]); 
                }
                //for (var key in this) { emit(key, null); }
            }
        """)

    reducer = Code("""
            function(key, stuff) { 
                let obj = {}
                stuff.filter(e => e[0] !== undefined).forEach(e => 
                obj[e[0]] = e[1])
                return obj; 
            }
        """)
    return mapper, reducer


def add_data_set(user_ID, is_private, name, description):
    path = os.path.join(UPLOAD_FOLDER, user_ID, name)
    ds = data_set_business.add(name=name, description=description, path=path)
    user = UserBusiness.get_by_user_ID(user_ID)
    ownership_business.add(user, is_private, data_set=ds)
    return ds


def import_data(data_array, data_set):
    new_data_array = []
    for data in data_array:
        # id field will conflict with object_id
        if 'id' in data:
            data['id_1'] = data.pop('id')
        if '_id' in data:
            data['_id_1'] = data.pop('_id')

        # data = {key: value for key, value in data.items()}

        new_data_array.append(data)
    # print(new_data_array)
    # import json
    # print(json.dumps(new_data_array))
    data_business.add_many(data_set, new_data_array)
    return data_set


# def import_data_from_file_id(file_id, data_set_name, ds_description, user_ID,
#                              is_private, names, **kwargs):
#     table = file_service.file_loader(file_id, user_ID, names)
#     return import_data(table, data_set_name, ds_description, user_ID,
#                        is_private, **kwargs)


def list_data_sets_by_user_ID(user_ID, order=-1, related_field=None, tag=None,
                              related_task=None, extension=None, file_type=None):
    if not user_ID:
        raise ValueError('no user id')
    public_ds = ownership_service.get_all_public_objects('data_set')
    owned_ds = ownership_service. \
        get_privacy_ownership_objects_by_user_ID(user_ID, 'data_set')

    public_ds = [deref_file(ds) for ds in public_ds
                 if combine_conditions(ds,
                                       [['related_field', related_field],
                                        ['file.extension', extension],
                                        ['file.type', file_type]],
                                       [['tags', tag],
                                        ['related_tasks', related_task]])]
    owned_ds = [deref_file(ds) for ds in owned_ds
                if combine_conditions(ds,
                                      [['related_field', related_field],
                                       ['file.extension', extension],
                                       ['file.type', file_type]],
                                      [['tags', tag],
                                       ['related_tasks', related_task]])]
    if order == -1:
        public_ds.reverse()
        owned_ds.reverse()
    return public_ds, owned_ds


def deref_file(data_set):
    if hasattr(data_set, 'file') and data_set.file:
        data_set.file_obj = data_set.file.to_mongo()
    return data_set


def combine_conditions(obj, equal_array, in_array):
    return all(tuple(get_attr(obj, e[0]) == e[1] for e in equal_array
                     if e[1] is not None and get_attr(obj, e[0]) is not None) +
               tuple(e[1] in get_attr(obj, e[0]) for e in in_array
                     if e[1] is not None and get_attr(obj, e[0]) is not None))


def get_attr(obj, key_str):
    keys = key_str.split('.')
    for k in keys:
        if hasattr(obj, k):
            obj = obj[k]
        else:
            return 'NO_KEY'
    return obj


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
    file = file_business.get_by_data_set(data_set_id)
    file_service.remove_file_by_id(file.id)
    data_business.remove_data_by_data_set_id(data_set_id)
    return data_set_business.remove_by_id(data_set_id)


def convert_fields_type(ds_id, f_t_arrays):
    """
    convert field types of data set
    :param ds_id: ObjectId
    :param f_t_arrays: array: [['name', 'str'],['age', 'int'], ['salary',
    'float']]
    :return: new staging_data_set object
    """

    ds = data_set_business.get_by_id(ds_id)

    data_objects = data_business.get_by_data_set(ds['id'])
    # convert mongoengine objects to dicts
    data_objects = json_utility.me_obj_list_to_dict_list(data_objects)
    # convert types of values in dicts
    result = data_utility.convert_data_array_by_fields(data_objects,
                                                       f_t_arrays)
    data_objects = result['result']

    # update all rows
    for data_obj in data_objects:
        data_business.update_by_id(data_obj['_id'], data_obj)

    if 'failure_count' in result:
        failure_count = result['failure_count']
        return {'result': ds, 'failure_count': failure_count}
    return {'result': ds}

