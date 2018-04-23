# -*- coding: UTF-8 -*-
import eventlet
eventlet.monkey_patch()

# looks like the problem was fixed in eventlet 0.22
# eventlet.monkey_patch(thread=False)
# eventlet.import_patched('mongoengine')

import os
import requests
from datetime import timedelta

from flask import Flask
from flask import jsonify
from flask import request
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_claims
from flask_socketio import SocketIO

from server3.repository import config
from server3.utility import json_utility
from server3.constants import PORT
from server3.constants import REDIS_SERVER
from server3.constants import USER_DIR
from server3.constants import HUB_SERVER
from server3.constants import ADMIN_TOKEN
from server3.business.user_business import UserBusiness

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')

app = Flask(__name__, static_url_path='/static',
            static_folder='../static')
app.secret_key = 'super-super-secret'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = timedelta(days=30)

socketio = SocketIO(app, logger=True, engineio_logger=True, ping_timeout=600,
                    async_mode='eventlet', message_queue=REDIS_SERVER)

CORS(app, supports_credentials=True)

# Setup the Flask-JWT-Extended extension
jwt = JWTManager(app)

from server3.route import file_route
from server3.route import ownership_route
from server3.route import project_route
from server3.route import data_route
from server3.route import staging_data_route
from server3.route import toolkit_route
from server3.route import user_route
from server3.route import monitor_route
from server3.route import model_route
from server3.route import visualization_route
from server3.route import served_model_route
from server3.route import job_route
from server3.route import request_route
from server3.route import chat_route
from server3.route import module_route
from server3.route import comments_route
from server3.route import request_answer_route
from server3.route import api_route
from server3.route import app_route
from server3.route import message_route
from server3.route import world_route
from server3.route import dataset_route


app.register_blueprint(file_route.file_app)
app.register_blueprint(ownership_route.ownership_app)
app.register_blueprint(project_route.project_app)
app.register_blueprint(data_route.data_app)
app.register_blueprint(staging_data_route.staging_data_app)
app.register_blueprint(toolkit_route.toolkit_app)
app.register_blueprint(model_route.model_app)
app.register_blueprint(user_route.user_app)
app.register_blueprint(monitor_route.monitor_app)
app.register_blueprint(visualization_route.visualization_app)
app.register_blueprint(served_model_route.served_model_app)
app.register_blueprint(job_route.job_app)
app.register_blueprint(request_route.user_request_app)
app.register_blueprint(chat_route.chat_app)
app.register_blueprint(module_route.module_app)
app.register_blueprint(comments_route.comments_app)
app.register_blueprint(request_answer_route.request_answer_app)
app.register_blueprint(api_route.api_app)
app.register_blueprint(app_route.app_app)
app.register_blueprint(message_route.message_app)
app.register_blueprint(world_route.world_app)
app.register_blueprint(dataset_route.dataset_app)


# This method will get whatever object is passed into the
# create_access_token method.
@jwt.user_claims_loader
def add_claims_to_access_token(user_ID):
    # add more claims in the future

    return {'user_ID': user_ID}


# This method will also get whatever object is passed into the
# create_access_token method, and let us define what the identity
# should be for this object
@jwt.user_identity_loader
def user_identity_lookup(user_ID):
    return user_ID


# This is an example for jwt_required
# Protect a view with jwt_required, which requires a valid access token
# in the request to access.
@app.route('/refresh_token', methods=['GET'])
@jwt_required
def refresh_token():
    # Access the identity of the current user with get_jwt_identity
    # current_user = get_jwt_identity()
    claims = get_jwt_claims()
    user = UserBusiness.get_by_user_ID(claims['user_ID'])
    user = json_utility.convert_to_json(user.to_mongo())
    return jsonify({'response': {'user': user}}), 200


@app.route('/hub_png/user/<hub_username>/kernelspecs/<language>/<filename>',
           methods=['GET'])
def hub_png(hub_username, language, filename):
    return requests.get(
        os.path.join(HUB_SERVER, 'user', '%2B'.join(hub_username.split('+')),
                     'kernelspecs', language, filename),
        headers={'Authorization': 'token ' +
                                  'cd780b98aeb34a7e9a88e9c0892751c5'}
        ).content


if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=PORT, debug=True)
