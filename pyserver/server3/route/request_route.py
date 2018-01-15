# -*- coding: UTF-8 -*-
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request

from server3.service import user_request_service
from server3.utility import json_utility

PREFIX = '/user_request'

user_request_app = Blueprint("user_request_app", __name__, url_prefix=PREFIX)


@user_request_app.route('', methods=['GET'])
def get_all_user_request():
    try:
        user_request = user_request_service.get_all_user_request()
        user_request = json_utility.convert_to_json([i.to_mongo()
                                                     for i in user_request])
    except Exception as e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': user_request}), 200)


@user_request_app.route('/<string:user_request_id>', methods=['GET'])
def get_request(user_request_id):
    if not user_request_id:
        return jsonify({'response': 'no user_request_id arg'}), 400
    try:
        user_request = user_request_service.get_by_id(user_request_id)
        user_request = json_utility.convert_to_json(user_request.to_mongo())
    except Exception as e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': user_request}), 200)


@user_request_app.route('/<string:user_ID>', methods=['GET'])
def list_user_request(user_ID):
    user_request = user_request_service.list_user_request_by_user_ID(user_ID)
    user_request = json_utility. \
        me_obj_list_to_json_list(user_request)
    return jsonify({'response': user_request}), 200


@user_request_app.route('', methods=['POST'])
def create_user_request():
    print('aha')
    print(request.json)
    if not request.json \
            or 'request_title' not in request.json \
            or 'request_description' not in request.json \
            or 'user_id' not in request.json:
        print('?????')
        return jsonify({'response': 'insufficient arguments'}), 400
    data = request.get_json()
    request_title = data['request_title']
    request_description = data['request_description']
    user_id = data['user_id']
    request_dataset = data['request_dataset']
    user_request_service.create_user_request(request_title, request_description,
                                             user_id,
                                             request_dataset=request_dataset)
    return jsonify({'response': 'create user_request success'}), 200


@user_request_app.route('/<string:user_request_id>', methods=['PUT'])
def update_project(user_request_id):
    if not request.json \
            or 'requestTitle' not in request.json \
            or 'requestDescription' not in request.json:
        return jsonify({'response': 'insufficient arguments'}), 400
    data = request.get_json()
    request_title = data['requestTitle']
    request_description = data['requestDescription']
    request_dataset = data['requestDataset']
    user_request_service.update_user_request(user_request_id, request_title,
                                             request_description,
                                             request_dataset=request_dataset)
    return jsonify({'response': 'create user_request success'}), 200


@user_request_app.route('/<string:user_request_id>', methods=['DELETE'])
def remove_user_request(user_request_id):
    user_id = request.args.get('user_ID')
    if not user_request_id:
        return jsonify({'response': 'no user_request_id arg'}), 400
    if not user_id:
        return jsonify({'response': 'no user_ID arg'}), 400
    result = user_request_service.remove_user_request_by_id(ObjectId(
        user_request_id), user_id)
    return jsonify({'response': result}), 200
