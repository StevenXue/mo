# -*- coding: UTF-8 -*-
import os
import csv
import zipfile

import pandas as pd

from server3.business import file_business
from server3.business import user_business
from server3.business import ownership_business
from server3.service import ownership_service
from server3.service import data_service
from server3.repository import config
from server3.constants import ALLOWED_EXTENSIONS
from server3.constants import PREDICT_FOLDER
from server3.utility import str_utility
from server3.utility import json_utility

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')
IGNORED_FILES = ['__MACOSX/']
PASSED_FILES = ['__MACOSX', '.DS_Store']


def add_file(data_set_name, file, url_base, user_ID, is_private=False,
             description='', ds_type='table', predict=False, names=None,
             **optional):
    """
    add file by all file attributes

    :param data_set_name: 
    :param file: 
    :param url_base: 
    :param user_ID: 
    :param is_private: 
    :param description: 
    :param ds_type: 
    :param predict: 
    :param names: 
    :param optional: 
    :return: 
    """
    if not user_ID:
        raise ValueError('no user id or private input')
    # check user existence
    user = user_business.get_by_user_ID(user_ID)
    if not user:
        raise NameError('no user found')

    save_directory = UPLOAD_FOLDER + user.user_ID + '/'
    file_url = url_base + user.user_ID + '/'
    if predict:
        save_directory += PREDICT_FOLDER

    # TODO need to be undo when failed
    filename_array = file.filename.rsplit('.', 1)
    extension = filename_array[1].lower()
    if extension == 'zip':
        # extract zip files
        file_size, file_uri, folder_name = \
            extract_files_and_get_size(file, save_directory)
        file_url += folder_name
    else:
        # save not zip files
        file_size, file_uri = save_file_and_get_size(file, save_directory)
        file_url += file.filename

    if predict:
        file_url += '?predict=true'

    # deal with tags, tasks etc.
    if 'tags' in optional:
        optional['tags'] = [x.strip() for x in optional['tags'].split(',')]
    if 'related_tasks' in optional:
        optional['related_tasks'] = [x.strip() for x in
                                     optional['related_tasks'].split(',')]

    # create file entity in database
    saved_file = file_business.add(file.filename, file_size, file_url,
                                   file_uri, description, extension, ds_type,
                                   predict=predict)

    ds = data_service.add_data_set(user_ID, is_private, data_set_name,
                                   description, saved_file, **optional)

    file_business.update_one_by_id(saved_file.id, data_set=ds)

    if names:
        names = [x.strip() for x in names.split(',')]

    if extension == 'csv':
        table = get_file_content(file_uri, names)
        data_service.import_data(table, ds)

    return saved_file.reload()


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


# TODO 优化逻辑
def list_file_by_extension(user_ID, extension=None, predict=False, order=-1):
    public_files, owned_files = list_files_by_user_ID(user_ID, order)
    if extension:
        public_files = [pf for pf in public_files
                        if pf.extension == extension and
                        check_predict(pf, 'predict', predict)]
        owned_files = [of for of in owned_files
                       if of.extension == extension and
                       check_predict(of, 'predict', predict)]
    else:
        public_files = [pf for pf in public_files
                        if check_predict(pf, 'predict', predict)]
        owned_files = [of for of in owned_files
                       if check_predict(of, 'predict', predict)]
    return public_files, owned_files


def check_predict(o, attr, value):
    predict = False
    if hasattr(o, attr) and o[attr] is True:
        predict = True
    return value is predict


def list_files_by_user_ID(user_ID, order=-1):
    if not user_ID:
        raise ValueError('no user id')
    public_files = ownership_service.get_all_public_objects('file')
    owned_files = ownership_service. \
        get_privacy_ownership_objects_by_user_ID(user_ID, 'file')

    if order == -1:
        public_files.reverse()
        owned_files.reverse()
    return public_files, owned_files


#######################################################################
# local file management

def save_file_and_get_size(file, path):
    if not os.path.exists(path):
        os.makedirs(path)
    file.save(os.path.join(path, file.filename))
    uri = path + file.filename
    return os.stat(os.path.join(uri)).st_size, uri


def extract_files_and_get_size(file, path):
    folder_name = safe_unzip(file, path)
    uri = os.path.join(path, folder_name)
    return get_tree_size(path), uri, folder_name


def get_tree_size(path):
    """
    Return total size of files in given path and subdirs.
    """
    total = 0
    for entry in os.scandir(path):
        if entry.is_dir(follow_symlinks=False):
            total += get_tree_size(entry.path)
        else:
            total += entry.stat(follow_symlinks=False).st_size
    return total


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

    return get_file_content(file.uri, names)


def get_file_content(file_uri, names):
    if not names:
        # if no names get the first line of csv as names
        with open(file_uri, encoding="utf-8") as f:
            reader = csv.reader(f)
            names = next(reader)  # gets the first line
    # convert invalid characters in names
    names = [str_utility.slugify(n, allow_unicode=True) for n in names]

    table = pd.read_csv(file_uri, skipinitialspace=True, names=names,
                        skiprows=[0])
    table = table.to_dict('records')
    return json_utility.convert_to_json(table)


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
