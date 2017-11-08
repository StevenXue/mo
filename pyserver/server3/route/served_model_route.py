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


@served_model_app.route('/update/<string:served_model_id>', methods=['POST'])
def update_deploy_info(served_model_id):
    """
    deploy trained model
    :param served_model_id:
    :return:
    """
    data = request.get_json()
    name = data.pop('deployName')
    description = data.pop('deployDescription')
    input_info = data.pop('deployInput')
    output_info = data.pop('deployOutput')
    examples = data.pop('deployExamples')

    served_model = served_model_service.update_db(served_model_id, name,
                                                  description, input_info,
                                                  output_info,  examples)
    if not served_model:
        return jsonify({'response': 'updated'}), 200
    served_model = json_utility.convert_to_json(served_model.to_mongo())
    return jsonify({'response': served_model})


@served_model_app.route('/first_deploy/<string:job_id>', methods=['POST'])
def first_deploy(job_id):
    """
    deploy trained model
    :param job_id:
    :return:
    """
    data = request.get_json()
    user_ID = data.pop('user_ID')
    name = data.pop('deployName')
    description = data.pop('deployDescription')
    input_info = data.pop('deployInput')
    output_info = data.pop('deployOutput')
    examples = data.pop('deployExamples')
    model_name = data.pop('model_name')
    projectId = data.pop('projectId')
    server = '10.52.14.182:9000'
    # 用户提供 or 从数据库 训练的dataset中 获取
    #
    input_type = '1darray'
    served_model = served_model_service.first_deploy(user_ID, job_id, name,
                                                     description, input_info,
                                                     output_info,
                                                     examples, server,
                                                     input_type, model_name,
                                                     projectId,is_private=False,
                                                     **data)
    if not served_model:
        return jsonify({'response': 'already deployed'}), 400
    served_model = json_utility.convert_to_json(served_model.to_mongo())
    return jsonify({'response': served_model})



@served_model_app.route('/<string:oid>', methods=['DELETE'])
def delete_served_model(oid):
    served_model_service.remove_by_id(oid)
    return jsonify({'response': 'removed'})


@served_model_app.route('/served_models', methods=['GET'])
def list_served_models():
    user_ID = request.args.get('user_ID')
    category = request.args.get('category')
    model_ID = request.args.get('model_ID')
    print('model_ID', model_ID)
    if user_ID:
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
    elif model_ID:
        model = served_model_service.get_by_model_id(model_ID)

        return jsonify({'response': model})
    else:
        all_public_served_models = served_model_service.list_all_served_models(category)
        return jsonify({'response': all_public_served_models})
# @served_model_app.route('/suspend/<string:oid>', methods=['PUT'])
# def suspend_served_model(oid):
#     if served_model_business.suspend_by_id(oid):
#         return jsonify({'response': 'suspended'})
#     else:
#         return jsonify({'response': 'suspend failed'}), 400


@served_model_app.route('/terminate/<string:oid>', methods=['PUT'])
def terminate_served_model(oid):
    if served_model_service.undeploy_by_id(oid):
        return jsonify({'response': 'terminated'})
    else:
        return jsonify({'response': 'terminate failed'}), 400


@served_model_app.route('/resume/<string:oid>', methods=['PUT'])
def resume_served_model(oid):
    data = request.get_json()
    user_ID = data.pop('user_ID')
    model_name = data.pop('model_name')
    new_server = served_model_service.resume_by_id(oid, user_ID, model_name)
    if new_server:
        return jsonify({'response': new_server})
    else:
        return jsonify({'response': 'resume failed'}), 400


@served_model_app.route('/predict/<string:oid>', methods=['POST'])
def get_prediction(oid):
    data = request.get_json()
    server = data.pop('server')
    model_name = data.pop('model_name')
    input_value = data.pop('input_value')
    features = data.pop('features')
    result = served_model_service.get_prediction_by_id(server, model_name, input_value,features)
    if result:
        return jsonify({'response': {'result': result}})
    else:
        return jsonify({'response': 'prediction failed'}), 400