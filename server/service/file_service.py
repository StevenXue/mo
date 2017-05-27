# -*- coding: UTF-8 -*-
import os
import csv
import io

from business import file_business
from business import user_business
from business import ownership_business
from service import ownership_service
from repository import config

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')


def add_file(file, url_base, user_ID, is_private=True, description=''):
    if not user_ID:
        raise ValueError('no user id or private input')
    # check user exists
    user = user_business.get_by_user_ID(user_ID)
    if not user:
        raise NameError('no user found')
    file_url = url_base + user.user_ID + '/' + file.filename
    save_directory = UPLOAD_FOLDER + user.user_ID + '/'
    file_size, file_uri = save_file_and_get_size(file, save_directory)
    saved_file = file_business.add(file.filename, file_size, file_url,
                                   file_uri, description)
    if saved_file:
        if not ownership_business.add(user, is_private,
                                      file=saved_file):
            # revert file saving
            file_business.delete_by_id(saved_file['_id'])
            raise RuntimeError('ownership create failed')
        else:
            return saved_file
    else:
        raise RuntimeError('file create failed')


# def list_files_by_user(user):
#     return file_business.list_by_user(user)


#######################################################################
# local file management

def save_file_and_get_size(file, path):
    if not os.path.exists(path):
        os.makedirs(path)
    file.save(os.path.join(path, file.filename))
    return os.stat(os.path.join(path)).st_size, path + file.filename


# get file
def file_loader(file_id, user_ID):
    file = file_business.get_by_id(file_id)
    # if user_ID != file,
    is_private = ownership_service.check_private(file, 'file')
    is_owned = ownership_service.check_ownership(user_ID, file, 'file')
    if is_private and not is_owned:
        raise Exception('file permission denied, private: %s, owned: %s' % (
            is_private, is_owned))
    with open(file.uri) as csv_data:
        reader = csv.reader(csv_data)

        # eliminate blank rows if they exist
        rows = [row for row in reader if row]
        headings = rows[0]  # get headings

        table = []
        for row in rows[1:]:
            row_data = {}
            for col_header, data_column in zip(headings, row):
                row_data[col_header] = data_column
            table.append(row_data)
    return table
