# -*- coding: UTF-8 -*-
import os
import csv
import io

from server3.business import file_business
from server3.business import user_business
from server3.business import ownership_business
from server3.service import ownership_service
from server3.repository import config

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')


def add_file(file, url_base, user_ID, is_private=False, description=''):
    """
    add file by all file attributes
    :param file: file instance
    :param url_base: url can use to fetch the file
    :param user_ID: user_ID
    :param is_private: true or false
    :param description: description of file
    :return:
    """
    if not user_ID:
        raise ValueError('no user id or private input')
    # check user existence
    user = user_business.get_by_user_ID(user_ID)
    if not user:
        raise NameError('no user found')
    file_url = url_base + user.user_ID + '/' + file.filename
    save_directory = UPLOAD_FOLDER + user.user_ID + '/'
    # TODO need to be undo when failed
    file_size, file_uri = save_file_and_get_size(file, save_directory)
    saved_file = file_business.add(file.filename, file_size, file_url,
                                   file_uri, description)
    if saved_file:
        if not ownership_business.add(user, is_private,
                                      file=saved_file):
            # revert file saving
            file_business.remove_by_id(saved_file['_id'])
            raise RuntimeError('ownership create failed')
        else:
            return saved_file
    else:
        raise RuntimeError('file create failed')


def remove_file_by_id(file_id):
    """
    remove file by id
    :param file_id: object_id of file to remove
    :return:
    """
    file_obj = file_business.get_by_id(file_id)
    uri = file_obj['uri']
    remove_file_by_uri(uri)
    return file_business.remove_by_id(file_id)


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
    with open(file.uri, 'rU') as csv_data:
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


def list_files_by_user_ID(user_ID, order=-1):
    if not user_ID:
        raise ValueError('no user id')
    public_files = ownership_service.get_all_public_objects('file')
    owned_files = ownership_service.\
        get_private_ownership_objects_by_user_ID(user_ID, 'file')

    if order == -1:
        public_files.reverse()
        owned_files.reverse()
    return public_files, owned_files


def remove_file_by_uri(uri):
    """
    remove file in directory
    :param uri: file uri
    :return:
    """
    os.remove(uri)
