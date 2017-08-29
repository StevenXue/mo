# -*- coding: UTF-8 -*-
"""
Blueprint for file

Author: Zhaofeng Li
Date: 2017.05.22
"""
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import request
from flask import send_from_directory

from server3.repository import config
from server3.service import served_model_service
from server3.business import served_model_business
from server3.utility import json_utility

PREFIX = '/served_model'
served_model_app = Blueprint("served_model_app", __name__, url_prefix=PREFIX)


@served_model_app.route('/deploy/<string:job_id>', methods=['POST'])
def deploy_trained_model(job_id):
    """
    deploy trained model
    :param job_id:
    :return:
    """
    data = request.get_json()
    user_ID = data.pop('user_ID')
    description = data.pop('description')
    name = data.pop('name')
    server = 'localhost:9000'
    signatures = data.pop('signatures')
    input_type = data.pop('input_type')
    served_model = served_model_service.deploy(user_ID, job_id, name,
                                               description, server,
                                               signatures, input_type, **data)
    if not served_model:
        return jsonify({'response': 'already deployed'}), 400
    served_model = json_utility.convert_to_json(served_model.to_mongo())
    return jsonify({'response': served_model})


@served_model_app.route('/<string:oid>', methods=['DELETE'])
def delete_served_model(oid):
    served_model_service.remove_by_id(oid)
    return jsonify({'response': 'removed'})


@served_model_app.route('/served_models', methods=['GET'])
def list_served_models_by_user_ID():
    user_ID = request.args.get('user_ID')
    if not user_ID:
        return jsonify({'response': 'insufficient args'}), 400

    public_served_models, owned_served_models = \
        served_model_service.list_served_models_by_user_ID(user_ID, order=-1)
    public_served_models = json_utility.me_obj_list_to_json_list(
        public_served_models)
    owned_served_models = json_utility.me_obj_list_to_json_list(
        owned_served_models)
    result = {
        'public_served_models': public_served_models,
        'owned_served_models': owned_served_models
    }
    return jsonify({'response': result})


@served_model_app.route('/suspend/<string:oid>', methods=['PUT'])
def suspend_served_model(oid):
    if served_model_business.suspend_by_id(oid):
        return jsonify({'response': 'suspended'})
    else:
        return jsonify({'response': 'suspend failed'}), 400


@served_model_app.route('/terminate/<string:oid>', methods=['PUT'])
def terminate_served_model(oid):
    if served_model_business.terminate_by_id(oid):
        return jsonify({'response': 'terminated'})
    else:
        return jsonify({'response': 'terminate failed'}), 400


@served_model_app.route('/resume/<string:oid>', methods=['PUT'])
def resume_served_model(oid):
    if served_model_business.resume_by_id(oid):
        return jsonify({'response': 'resumed'})
    else:
        return jsonify({'response': 'resume failed'}), 400
