from business import data_business
from business import data_set_business
from business import ownership_business
from business import user_business


def add_data_set(data_set_name, ds_description, user_ID, is_private):
    ds = data_set_business.add(data_set_name, ds_description)
    user = user_business.get_by_user_ID(user_ID)
    os = ownership_business.add(user, is_private, data_set=ds)
    return ds


def import_data(data_array, data_set_name, ds_description, user_ID, is_private):
    # find data set, if not exists add new one
    ds = data_set_business.get_by_name(data_set_name)
    if ds is None:
        ds = add_data_set(data_set_name, ds_description, user_ID, is_private)
    for data in data_array:
        data_business.add(ds, data)

