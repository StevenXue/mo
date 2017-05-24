"""
Blueprint for file

Author: Zhaofeng Li
Date: 2017.05.22
"""

from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import request
from flask import send_from_directory

from repository import config
from service import file_service

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')


ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'csv'])
PREFIX = '/file'
UPLOAD_URL = '/uploads/'
REQUEST_FILE_NAME = 'uploaded_file'


file_app = Blueprint("file_app", __name__, url_prefix=PREFIX)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@file_app.route('/upload_file', methods=['POST'])
def upload_file():
    user_ID = request.args.get('user_ID')
    if_private = request.args.get('if_private')
    if request.method == 'POST':
        # check if the post request has the file part
        if REQUEST_FILE_NAME not in request.files:
            return make_response(jsonify({'response': 'no file part'},
                                         400))
        file = request.files[REQUEST_FILE_NAME]
        if file.filename == '':
            return make_response(jsonify({'response': 'no selected file'},
                                         400))
        if file and allowed_file(file.filename):
            url_base = PREFIX + UPLOAD_URL
            file_url = file_service.add_file(file, url_base,
                                             user_ID, if_private)
            # try:
            #     # file_size = file_service.save_file_and_get_size(file)
            #     file_url = PREFIX + UPLOAD_URL + file.filename
            #     file_service.add_file(file, file_url,
            #                           user_ID, if_private)
            # except Exception, e:
            #     return make_response(jsonify({'response': '%s: %s' % (str(
            #         Exception), e.args)}, 400))
            return redirect(file_url)
        else:
            return make_response(jsonify({'response': 'file is not allowed'},
                                         400))


@file_app.route(UPLOAD_URL + '<user_ID>/<filename>')
def uploaded_file(user_ID, filename):
    path = '%s%s/' % (UPLOAD_FOLDER, user_ID)
    return send_from_directory(path, filename)
