# -*- coding: UTF-8 -*-
import sys
from os import path
sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

from flask import Flask
from flask_cors import CORS

from server.route import file

UPLOAD_FOLDER = './'

app = Flask(__name__, static_url_path='')
CORS(app, supports_credentials=True)


app.register_blueprint(file.file_app)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
