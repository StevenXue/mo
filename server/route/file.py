"""
Blueprint for logs

Author: Li Zhe
Date: 2017.05.02
"""
import os

from flask import Blueprint
from flask import request
from flask import jsonify
from flask import make_response
from flask import flash
from flask import redirect
from flask import url_for
from flask import send_from_directory

from werkzeug.utils import secure_filename

ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'csv'])
PREFIX = '/file'
UPLOAD_URL = '/uploads/'

file_app = Blueprint("file_app", __name__, url_prefix=PREFIX)


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@file_app.route('/upload_file', methods=['POST'])
def upload_file():
    if request.method == 'POST':
        # check if the post request has the file part
        if 'uploaded_file' not in request.files:
            return make_response(jsonify({'response': 'no file part'},
                                         400))
        file = request.files['uploaded_file']
        if file.filename == '':
            return make_response(jsonify({'response': 'no selected file'},
                                         400))
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)

            from server.run import app as flask_app
            file.save(os.path.join(flask_app.config['UPLOAD_FOLDER'], filename))
            file_url = PREFIX+UPLOAD_URL+filename
            file_size = os.stat(request.files['post-photo']).st_size

            return redirect(file_url)
        else:
            return make_response(jsonify({'response': 'file is not allowed'},
                                         400))


@file_app.route(UPLOAD_URL+'<filename>')
def uploaded_file(filename):
    from server.run import app as flask_app
    return send_from_directory(flask_app.config['UPLOAD_FOLDER'],
                               filename)
