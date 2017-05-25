# -*- coding: UTF-8 -*-
from flask import Flask
from flask_cors import CORS

from route import file_route
from route import ownership_route
from route import project_route
from route import data_route
from route import analysis_route
from repository import config

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')

app = Flask(__name__, static_url_path='')
CORS(app, supports_credentials=True)

app.register_blueprint(file_route.file_app)
app.register_blueprint(ownership_route.ownership_app)
app.register_blueprint(project_route.project_app)
app.register_blueprint(data_route.data_app)
app.register_blueprint(analysis_route.analysis_app)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
