# -*- coding: UTF-8 -*-
"""
Blueprint for file

Author: Zhaofeng Li
Date: 2017.05.22
"""
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import request
from flask import send_from_directory

from repository import config
from service import file_service
from utility import json_utility

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')


ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'csv'])
PREFIX = '/file'
UPLOAD_URL = '/uploads/'
REQUEST_FILE_NAME = 'uploaded_file'


file_app = Blueprint("file_app", __name__, url_prefix=PREFIX)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@file_app.route('/fake_upload', methods=['POST'])
def fake_upload():
    return make_response(jsonify({'response': 'fake'}), 200)


@file_app.route('/upload_file', methods=['POST'])
def upload_file():
    # data = request.get_json()
    # user_ID = data['user_ID']
    # if_private = data['if_private']
    # description = data['description']
    print request.form
    user_ID = request.form['user_ID']
    is_private = request.form['if_private']
    description = request.form['description']
    # convert string to bool
    is_private = str(is_private).lower() == 'true'

    if request.method == 'POST':
        # check if the post request has the file part
        if REQUEST_FILE_NAME not in request.files:
            return make_response(jsonify({'response': 'no file part'}), 400)
        file = request.files[REQUEST_FILE_NAME]
        if file.filename == '':
            return make_response(jsonify({'response': 'no selected file'}), 400)
        if file and allowed_file(file.filename):
            try:
                url_base = PREFIX + UPLOAD_URL
                saved_file = file_service.add_file(file, url_base,
                                             user_ID, is_private, description)
                file_json = json_utility.convert_to_json(saved_file.to_mongo())
            except Exception, e:
                return make_response(jsonify({'response': '%s: %s' % (str(
                    Exception), e.args)}), 400)
            return make_response(jsonify({'response': file_json}), 200)
        else:
            return make_response(jsonify({'response': 'file is not allowed'}),
                                 400)


@file_app.route(UPLOAD_URL + '<user_ID>/<filename>')
def uploaded_file(user_ID, filename):
    path = '%s%s/' % (UPLOAD_FOLDER, user_ID)
    return send_from_directory(path, filename)


@file_app.route('/list_files_by_user_ID', methods=['GET'])
def list_files_by_user_ID():
    user_ID = request.args.get('user_ID')
    try:
        public_files, owned_files = file_service.list_files_by_user_ID(user_ID)
        public_files = json_utility.me_obj_list_to_dict_list(public_files)
        owned_files = json_utility.me_obj_list_to_dict_list(owned_files)
        result = {
            'public_files': public_files,
            'owned_files': owned_files
        }
    except Exception, e:
        return make_response(jsonify({'response': '%s: %s' % (str(
                             Exception), e.args)}), 400)
    return make_response(jsonify({'response': result}), 200)


@file_app.route('/remove_file_by_id', methods=['GET'])
def remove_file_by_id():
    file_id = request.args.get('file_id')
    try:
        result = file_service.remove_file_by_id(ObjectId(file_id))
    except Exception, e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': result}), 200)
