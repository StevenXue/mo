from server.repository import user_repo
from server.repository import data_repo
from server.repository import data_set_repo
from server.repository import ownership_repo


def import_data(data_array, data_set_name):
    ds_obj = data_set_repo.find_one({'name': data_set_name})
    # user_obj = user.find_unique_one({'name': owner_name})
    # ownership_obj = ownership.find_unique_one({'owner': user_obj})

    if ds_obj:
        # ds exists insert data to it
        for row in data_array:
            row['data_set'] = ds_obj
            data_repo.save_one(row)
    else:
        # TODO raise en error
        return False
