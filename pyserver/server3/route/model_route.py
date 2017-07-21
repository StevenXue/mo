# -*- coding: UTF-8 -*-
"""
Blueprint for analysis

Author: Zhaofeng Li
Date: 2017.06.30
"""
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request

from server3.service import model_service
from server3.service import staging_data_service
from server3.business import model_business
from server3.business import toolkit_business
from server3.business import staging_data_business
from server3.utility import json_utility

PREFIX = '/model'

model_app = Blueprint("model_app", __name__, url_prefix=PREFIX)

ALLOWED_EXTENSIONS = set(['py'])
# UPLOAD_URL = '/uploads/'
REQUEST_FILE_NAME = 'uploaded_code'


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@model_app.route('/models/public', methods=['GET'])
def get_all_model_info():
    try:
        result = model_service.get_all_public_model()
    except Exception as e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return jsonify({'message': 'get info success', 'response':
        json_utility.convert_to_json(result)}), 200


@model_app.route('/models/<string:model_id>', methods=['GET'])
def get_model(model_id):
    try:
        model = model_business.get_by_model_id(ObjectId(model_id))
        model = json_utility.convert_to_json(model.to_mongo())
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': model}), 200


@model_app.route('/models/run/<string:model_id>', methods=['POST'])
def run_model(model_id):
    data = request.get_json()
    conf = data['conf']
    project_id = data['project_id']
    staging_data_set_id = data['staging_data_set_id']
    schema = data['schema']
    try:
        result = model_service.run_model(conf, project_id, staging_data_set_id,
                                         model_id,
                                         schema=schema)
        result = json_utility.convert_to_json(result)
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': result}), 200


@model_app.route('/models/run_multiple/<string:model_id>', methods=['POST'])
def run_multiple_model(model_id):
    data = request.get_json()
    conf = data['conf']
    project_id = data['project_id']
    staging_data_set_id = data['staging_data_set_id']
    schema = data['schema']

    hyper_parameters = data['hyper_parameters']
    result = model_service.run_multiple_model(conf, project_id, staging_data_set_id, model_id,
                                     schema=schema, hyper_parameters=hyper_parameters)
    print("result length", len(result))
    return jsonify({'response': result}), 200


@model_app.route('/models/to_code/<string:model_id>', methods=['POST'])
def model_to_code(model_id):
    data = request.get_json()
    conf = data['conf']
    project_id = data['project_id']
    staging_data_set_id = data['staging_data_set_id']
    schema = data['schema']
    try:
        code = model_service.model_to_code(conf, project_id,
                                           staging_data_set_id,
                                           model_id, schema=schema)
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': code}), 200
