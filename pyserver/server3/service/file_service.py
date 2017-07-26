# -*- coding: UTF-8 -*-
import os
import csv
import io
import zipfile

import pandas as pd

from server3.business import file_business
from server3.business import user_business
from server3.business import ownership_business
from server3.service import ownership_service
from server3.repository import config
from server3.constants import ALLOWED_EXTENSIONS

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')
IGNORED_FILES = ['__MACOSX/']
PASSED_FILES = ['__MACOSX', '.DS_Store']


def add_file(file, url_base, user_ID, is_private=False, description='',
             type='table'):
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
    save_directory = UPLOAD_FOLDER + user.user_ID + '/'
    # TODO need to be undo when failed
    filename_array = file.filename.rsplit('.', 1)
    extension = filename_array[1].lower()
    if extension == 'zip':
        file_size, file_uri, folder_name = \
            extract_file_and_get_size(file, save_directory)
        file_url = url_base + user.user_ID + '/' + folder_name
    else:
        file_size, file_uri = save_file_and_get_size(file, save_directory)
        file_url = url_base + user.user_ID + '/' + file.filename

    saved_file = file_business.add(file.filename, file_size, file_url,
                                   file_uri, description, extension, type)
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
    uri = path + file.filename
    return os.stat(os.path.join(uri)).st_size, uri


def extract_file_and_get_size(file, path):
    folder_name = safe_unzip(file, path)
    uri = path + folder_name
    return os.stat(os.path.join(uri)).st_size, uri, folder_name


def safe_unzip(zip_file, extractpath='.'):
    with zipfile.ZipFile(zip_file, 'r') as zf:
        for member in zf.infolist():
            if member.filename in IGNORED_FILES:
                continue
            if not allowed_file_or_folder(member.filename):
                raise TypeError(
                    '{} is not allowed file type'.format(member.filename))
            member_path = os.path.join(extractpath, member.filename)
            abspath = os.path.abspath(member_path)
            if abspath.startswith(os.path.abspath(extractpath)):
                if os.path.exists(abspath):
                    raise IOError('{} exists'.format(member_path))
                zf.extract(member, extractpath)
        # FIXME assume there's one and only one folder in zip and all files
        # in that folder
        return zf.namelist()[0]


# get file
def file_loader(file_id, user_ID, names):
    """
    read csv file to list of dict
    :param file_id:
    :param user_ID:
    :return: list of dict
    """
    file = file_business.get_by_id(file_id)
    # if user_ID != file,
    is_private = ownership_service.check_private(file, 'file')
    is_owned = ownership_service.check_ownership(user_ID, file, 'file')
    if is_private and not is_owned:
        raise Exception('file permission denied, private: %s, owned: %s' % (
            is_private, is_owned))
    table = pd.read_csv(file.uri, skipinitialspace=True, names=names) \
        .to_dict('records')
    return table


def list_files_by_user_ID(user_ID, order=-1):
    if not user_ID:
        raise ValueError('no user id')
    public_files = ownership_service.get_all_public_objects('file')
    owned_files = ownership_service. \
        get_private_ownership_objects_by_user_ID(user_ID, 'file')

    if order == -1:
        public_files.reverse()
        owned_files.reverse()
    return public_files, owned_files


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def allowed_file_or_folder(filename):
    return any(x in filename for x in PASSED_FILES) or '.' not in filename or \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


def remove_file_by_uri(uri):
    """
    remove file in directory
    :param uri: file uri
    :return:
    """
    os.remove(uri)
