# -*- coding: UTF-8 -*-
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request

from server3.service import user_request_service
from server3.service import user_service
from server3.utility import json_utility

PREFIX = '/user_request'

user_request_app = Blueprint("user_request_app", __name__, url_prefix=PREFIX)


@user_request_app.route('', methods=['GET'])
def get_user_request():
    user_request_id = request.args.get("user_request_id")
    if not user_request_id:
        # 返回所有的 user_request
        try:
            user_request = user_request_service.get_all_user_request()
            user_request = json_utility.convert_to_json([i.to_mongo()
                                                         for i in user_request])
        except Exception as e:
            return make_response(jsonify({'response': '%s: %s' %
                                                      (
                                                      str(Exception), e.args)}),
                                 400)
        return make_response(jsonify({'response': user_request}), 200)
    try:
        print('haha')
        print(user_request_id)
        user_request = user_request_service.get_by_id(user_request_id)
        user_request = json_utility.convert_to_json(user_request.to_mongo())
        print('user_request', user_request)
    except Exception as e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': user_request}), 200)


@user_request_app.route('', methods=['GET'])
def list_user_request():
    user_id = request.args.get("user_ID")
    if not user_id:
        return jsonify({'response': 'no user_id arg'}), 400
    else:
        user_request = user_request_service.list_user_request_by_user_ID(
            user_id)
        user_request = json_utility. \
            me_obj_list_to_json_list(user_request)
        return jsonify({'response': user_request}), 200


@user_request_app.route('', methods=['POST'])
def create_user_request():
    if not request.json \
            or 'request_title' not in request.json \
            or 'user_id' not in request.json:
        return jsonify({'response': 'insufficient arguments'}), 400
    data = request.get_json()
    request_title = data['request_title']
    user_id = data['user_id']
    request_dataset = data.get('request_dataset', None)
    request_description = data.get('request_description', None)
    request_input = data.get('request_input', None)
    request_output = data.get('request_output', None)
    request_tags = data.get('request_tags', None)
    request_category = data.get('request_category', None)

    kwargs = {}
    if request_dataset:
        kwargs['request_dataset'] = request_dataset
    if request_description:
        kwargs['description'] = request_description
    if request_input:
        kwargs['input'] = request_input
    if request_tags:
        request_tags = request_tags.split(",")
        kwargs['tags'] = request_tags
    if request_category:
        print('request_category', request_category)
        kwargs['category'] = request_category
    if request_output:
        kwargs['output'] = request_output
    user_request_service.create_user_request(request_title, user_id,
                                             **kwargs)
    return jsonify({'response': 'create user_request success'}), 200


@user_request_app.route('/votes', methods=['PUT'])
def update_user_request_votes():
    data = request.get_json()
    user_request_id = data["user_request_id"]
    votes_user_id = data["votes_user_id"]
    user_request_service.update_votes(user_request_id, votes_user_id)
    user_service.update_request_vote(user_request_id, votes_user_id)
    return jsonify({'response': 'update_user_request_votes'}), 200


@user_request_app.route('', methods=['PUT'])
def update_user_request():
    user_request_id = request.args.get("user_request_id")
    if not request.json \
            or 'requestTitle' not in request.json:
        return jsonify({'response': 'insufficient arguments'}), 400
    data = request.get_json()
    request_title = data['requestTitle']
    request_description = data.get('request_description')
    request_dataset = data.get('request_dataset')
    user_request_service.update_user_request(user_request_id, request_title,
                                             request_description,
                                             request_dataset=request_dataset)
    return jsonify({'response': 'update user_request success'}), 200


@user_request_app.route('', methods=['DELETE'])
def remove_user_request():
    user_request_id = request.args.get("user_request_id")
    user_id = request.args.get('user_ID')
    if not user_request_id:
        return jsonify({'response': 'no user_request_id arg'}), 400
    if not user_id:
        return jsonify({'response': 'no user_ID arg'}), 400
    result = user_request_service.remove_user_request_by_id(ObjectId(
        user_request_id), user_id)
    return jsonify({'response': result}), 200
