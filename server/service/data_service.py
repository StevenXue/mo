from mongoengine import *
from business import data_business
from business import data_set_business
from business import ownership_business
from business import user_business
from service import file_service


def add_data_set(data_set_name, ds_description, user_ID, is_private):
    ds = data_set_business.add(data_set_name, ds_description)
    user = user_business.get_by_user_ID(user_ID)
    os = ownership_business.add(user, is_private, data_set=ds)
    return ds


def import_data(data_array, data_set_name, ds_description, user_ID, is_private):
    # find data set, if not exists add new one
    try:
        ds = data_set_business.get_by_name(data_set_name)
    except DoesNotExist:
        ds = add_data_set(data_set_name, ds_description, user_ID, is_private)
    for data in data_array:
        data_business.add(ds, data)


def import_data_from_file_object_id(file_object_id, data_set_name, ds_description, user_ID, is_private):
    table = file_service.file_loader(file_object_id)
    import_data(table, data_set_name, ds_description, user_ID, is_private)