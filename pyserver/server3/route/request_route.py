# -*- coding: UTF-8 -*-
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity

from server3.service.user_request_service import UserRequestService
from server3.service.user_service import UserService
from server3.business.user_request_business import UserRequestBusiness
from server3.business.request_answer_business import RequestAnswerBusiness
from server3.business.comments_business import CommentsBusiness
from server3.utility import json_utility


PREFIX = '/user_requests'

user_request_app = Blueprint("user_request_app", __name__, url_prefix=PREFIX)


@user_request_app.route('/<user_request_id>', methods=['GET'])
def get_user_request(user_request_id):
    try:
        user_request = UserRequestService.get_by_id(user_request_id)
        user_request_info = json_utility.convert_to_json(
            user_request.to_mongo())
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
    search_query = request.args.get('search_query', None)

    search_tags = request.args.get('search_tags', None)

    type = request.args.get('type', None)
    user_ID = request.args.get('user_ID', None)
    if type == 'all':
        type = None
    if search_tags:
        search_tags = search_tags.split(',')
    user_requests, total_number = UserRequestService.get_list(
        type=type,
        search_query=search_query,
        search_tags=search_tags,
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
            RequestAnswerBusiness.answer_number_of_user_request(
                each_request_info['_id'])

        each_request_info['comment_number'] = \
            CommentsBusiness.count_comments(
                each_request_info['_id'], comments_type='request')

        each_request_info['user_ID'] = each_request.user.user_ID
        user_requests_info.append(each_request_info)
    return jsonify({'response': {'user_request': user_requests_info,
                                 'total_number': total_number}}), 200


@user_request_app.route('', methods=['POST'])
@jwt_required
def create_user_request():
    if not request.json \
            or 'title' not in request.json or 'type' not in request.json:
        return jsonify({'response': 'insufficient arguments'}), 400
    data = request.get_json()
    title = data.pop('title')
    user_ID = get_jwt_identity()
    # data['tags'] = data['tags'].split(",") if data['tags'] else None
    user_request = UserRequestService.create_user_request(title, user_ID,
                                                          **data)
    user_request = json_utility.convert_to_json(user_request.to_mongo())
    return jsonify({'response': user_request}), 200


@user_request_app.route('/<user_request_id>', methods=['PUT'])
@jwt_required
def update_user_request(user_request_id):
    data = request.get_json()
    result = UserRequestService.update_user_request(user_request_id, **data)
    result = json_utility.convert_to_json(result.to_mongo())
    return jsonify({'response': result}), 200


@user_request_app.route('/votes', methods=['PUT'])
@jwt_required
def update_user_request_votes():
    data = request.get_json()
    user_request_id = data["user_request"]
    # votes_user_id = data["votes_user_id"]
    # result = user_service.update_request_vote(user_request_id, votes_user_id)
    user_ID = get_jwt_identity()
    result = UserService.action_entity(user_ID=user_ID,
                                       entity_id=user_request_id,
                                       action='vote_up', entity='request')

    result = json_utility.convert_to_json(result.entity.to_mongo())
    return jsonify({'response': result}), 200


@user_request_app.route('/star', methods=['PUT'])
@jwt_required
def update_user_request_star():
    data = request.get_json()
    user_request_id = data["user_request_id"]
    # star_user_id = data["star_user_id"]
    user_ID = get_jwt_identity()
    # result = user_service.update_request_star(user_request_id, star_user_id)
    result = UserService.action_entity(user_ID=user_ID,
                                       entity_id=user_request_id,
                                       action='star', entity='request')

    result = json_utility.convert_to_json(result.entity.to_mongo())
    return jsonify({'response': result}), 200


@user_request_app.route('/<user_request_id>', methods=['DELETE'])
@jwt_required
def remove_user_request_by_id(user_request_id):
    user_ID = get_jwt_identity()
    result = UserRequestService.remove_by_id(ObjectId(
        user_request_id), user_ID)
    return jsonify({'response': result}), 200


@user_request_app.route('', methods=['DELETE'])
@jwt_required
def remove_user_request():
    # data = request.get_json()
    # user_ID = data['user_ID']
    user_ID = get_jwt_identity()
    result = UserRequestService.remove_by_user_ID(user_ID)
    return jsonify({'response': result}), 200


@user_request_app.route("/get_hot_tag", methods=["GET"])
def get_hot_tag():
    search_query = request.args.get('search_query', None)
    request_type = request.args.get('request_type', None)
    return jsonify(
        UserRequestBusiness.get_hot_tag(search_query, request_type,
                                        user_request=True))
