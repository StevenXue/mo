"""
Blueprint for logs

Author: Zhaofeng Li
Date: 2017.05.22
"""

from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import request
from flask import send_from_directory

from service import file_service

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

            file_size = file_service.save_file_and_get_size(file)
            file_url = PREFIX + UPLOAD_URL + file.filename

            try:
                file_service.add_file(file.filename, file_size, file_url,
                                      user_ID, if_private)
            except ValueError:
                return make_response(jsonify({'response': str(ValueError)},
                                             400))
            except NameError:
                return make_response(jsonify({'response': str(NameError)},
                                             400))
            return redirect(file_url)
        else:
            return make_response(jsonify({'response': 'file is not allowed'},
                                         400))


@file_app.route(UPLOAD_URL + '<filename>')
def uploaded_file(filename):
    from run import app as flask_app
    return send_from_directory(flask_app.config['UPLOAD_FOLDER'],
                               filename)
