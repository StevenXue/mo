# -*- coding: UTF-8 -*-
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity

from server3.service import user_request_service
from server3.service import request_answer_service

from server3.service import user_service
from server3.utility import json_utility

from server3.business import user_business
PREFIX = '/user_requests'

user_request_app = Blueprint("user_request_app", __name__, url_prefix=PREFIX)


@user_request_app.route('/<user_request_id>', methods=['GET'])
def get_user_request(user_request_id):
    try:
        user_request = user_request_service.get_by_id(user_request_id)
        user_request_info = json_utility.convert_to_json(user_request.to_mongo())
        user_request_info['user_ID'] = user_request.user.user_ID
    except Exception as e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': user_request_info}), 200)


@user_request_app.route('', methods=['GET'])
@jwt_required
def list_user_request():
    group = request.args.get('group')
    page_no = int(request.args.get('page_no', 1))
    page_size = int(request.args.get('page_size', 5))
    search_query = request.args.get('query', None)
    user_ID = None
    if group == 'my':
        user_ID = get_jwt_identity()

    user_requests, total_number = user_request_service.get_list(
        search_query=search_query,
        page_no=page_no,
        page_size=page_size,
        user_ID=user_ID
    )
    # user_requests_info = json_utility.me_obj_list_to_json_list(user_requests)
    # 读取每个request下anser的数量
    user_requests_info = []
    for each_request in user_requests:
        each_request_info = json_utility.convert_to_json(
            each_request.to_mongo())
        each_request_info['answer_number'] = \
            request_answer_service.get_all_answer_of_this_user_request(
                each_request_info['_id'], get_number=True)
        each_request_info['user_ID'] = each_request.user.user_ID
        user_requests_info.append(each_request_info)
    return jsonify({'response': {'user_request': user_requests_info,
                                 'total_number': total_number}}), 200


@user_request_app.route('', methods=['POST'])
@jwt_required
def create_user_request():
    if not request.json \
            or 'request_title' not in request.json :
        return jsonify({'response': 'insufficient arguments'}), 400
    data = request.get_json()
    request_title = data['request_title']
    user_ID = get_jwt_identity()
    # user_ID = data['user_ID']
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
        kwargs['category'] = request_category
    if request_output:
        kwargs['output'] = request_output
    user_request_service.create_user_request(request_title, user_ID,
                                             **kwargs)

    return jsonify({'response': 'create user_request success'}), 200


@user_request_app.route('/votes', methods=['PUT'])
def update_user_request_votes():
    data = request.get_json()
    user_request_id = data["user_request_id"]
    votes_user_id = data["votes_user_id"]
    result = user_service.update_request_vote(user_request_id, votes_user_id)
    result = json_utility.convert_to_json(result)
    print('update_user_request_votes')
    return jsonify({'response': result}), 200


@user_request_app.route('/star', methods=['PUT'])
def update_user_request_star():
    data = request.get_json()
    user_request_id = data["user_request_id"]
    star_user_id = data["star_user_id"]
    result = user_service.update_request_star(user_request_id, star_user_id)
    result = json_utility.convert_to_json(result.to_mongo())
    print('update_user_request_star')
    return jsonify({'response': result}), 200


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


@user_request_app.route('/<user_request_id>', methods=['DELETE'])
@jwt_required
def remove_user_request_by_id(user_request_id):
    user_ID = get_jwt_identity()
    result = user_request_service.remove_by_id(ObjectId(
        user_request_id), user_ID)
    return jsonify({'response': result}), 200


@user_request_app.route('', methods=['DELETE'])
# @jwt_required
def remove_user_request():
    data = request.get_json()
    user_ID = data['user_ID']
    # user_ID = get_jwt_identity()
    result = user_request_service.remove_by_user_ID(user_ID)
    return jsonify({'response': result}), 200