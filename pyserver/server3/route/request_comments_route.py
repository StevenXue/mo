# -*- coding: UTF-8 -*-
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity

from server3.service import comments_service
from server3.utility import json_utility

PREFIX = '/user_request_comments'

user_request_comments_app = Blueprint("user_request_comments_app", __name__,
                                      url_prefix=PREFIX)


@user_request_comments_app.route('', methods=['GET'])
def list_user_request_comments():
    user_request_id = request.args.get("user_request_id")
    user_ID = request.args.get("user_ID")

    if user_request_id:
        user_request_comments = comments_service. \
            get_comments_of_this_user_request(user_request_id)
        user_request_comments = json_utility. \
            me_obj_list_to_json_list(user_request_comments)
        return jsonify({'response': user_request_comments}), 200
    elif user_ID:
        user_request_comments = comments_service.\
            list_user_request_comments_by_user_id(user_ID)
        user_request_comments = json_utility. \
            me_obj_list_to_json_list(user_request_comments)
        return jsonify({'response': user_request_comments}), 200
    else:
        return jsonify({'response': 'insufficient arguments'}), 400


@user_request_comments_app.route('', methods=['POST'])
@jwt_required
def create_user_request_comments():
    if not request.json \
            or 'comments' not in request.json \
            or 'user_request_id' not in request.json:
        return jsonify({'response': 'insufficient arguments'}), 400
    data = request.get_json()
    comments = data['comments']
    user_ID = get_jwt_identity()
    user_request_id = data['user_request_id']
    comments_type = data['comments_type']
    request_answer_id = data.get('request_answer', None)
    comments_service.create_user_request_comments(
        user_request_id, user_ID, comments, comments_type, request_answer_id)
    return jsonify({'response': 'create user_request_comments success'}), 200


@user_request_comments_app.route('', methods=['PUT'])
@jwt_required
def update_user_request_comments():
    user_request_comments_id = request.args.get("user_request_comments_id")
    if not request.json \
            or 'comments' not in request.json \
            or 'user_request_comments_id' not in request.json:
        return jsonify({'response': 'insufficient arguments'}), 400
    data = request.get_json()
    comments = data['comments']
    user_ID = get_jwt_identity()
    comments_service.update_user_request_comments(
        user_request_comments_id, user_ID, comments)
    return jsonify({'response': 'update user_request_comments success'}), 200


@user_request_comments_app.route('', methods=['DELETE'])
@jwt_required
def remove_user_request_comments():
    user_ID = get_jwt_identity()
    user_request_comments_id = request.args.get('user_request_comments_id')
    if not user_request_comments_id:
        return jsonify({'response': 'no user_request_comments_id arg'}), 400

    result = comments_service.remove_user_request_comments_by_id(
        ObjectId(user_request_comments_id), user_ID)
    return jsonify({'response': result}), 200
