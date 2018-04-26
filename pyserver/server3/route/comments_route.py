# -*- coding: UTF-8 -*-
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity

from server3.business.comments_business import CommentsBusiness
from server3.business.user_business import UserBusiness
from server3.utility import json_utility

PREFIX = '/comments'

comments_app = Blueprint('comments_app', __name__,
                         url_prefix=PREFIX)


@comments_app.route('', methods=['GET'])
def list_comments():
    _id = request.args.get('_id')
    comments_type = request.args.get('comments_type')
    page_no = int(request.args.get('page_no', 1))
    page_size = int(request.args.get('page_size', 5))
    comments, total_number = CommentsBusiness. \
        get_comments(_id,
                     comments_type,
                     page_no,
                     page_size)
    for comment in comments:
        comment.user_ID = comment.comments_user.user_ID
        if hasattr(comment.comments_user, 'avatar'):
            comment.avatar = comment.comments_user.avatar
    comments = json_utility. \
        me_obj_list_to_json_list(comments)

    return jsonify(
        {'response': {'comments': comments, 'total_number': total_number}}), 200


@comments_app.route('', methods=['POST'])
@jwt_required
def create_comments():
    user_ID = get_jwt_identity()
    data = request.get_json()
    comments = data['comments']
    comments_type = data['comments_type']
    if comments_type in ['request', 'answer', 'project']:
        _id = data.get('_id')
    else:
        return jsonify({'response': 'error comments type'}), 400
    comments_user = UserBusiness.get_by_user_ID(user_ID)
    CommentsBusiness.add_comments(_id, comments_user, comments, comments_type)
    return jsonify({'response': 'create comments success'}), 200


@comments_app.route('', methods=['PUT'])
@jwt_required
def update_comments():
    comments_id = request.args.get("comments_id")
    if not request.json \
            or 'comments' not in request.json \
            or 'comments_id' not in request.json:
        return jsonify({'response': 'insufficient arguments'}), 400
    data = request.get_json()
    comments = data['comments']
    user_ID = get_jwt_identity()
    CommentsBusiness.update_by_id(
        comments_id, user_ID, comments)
    return jsonify({'response': 'update comments success'}), 200


@comments_app.route('', methods=['DELETE'])
@jwt_required
def remove_comments():
    user_ID = get_jwt_identity()
    _id = request.args.get('_id')
    if not _id:
        return jsonify({'response': 'no comments_id arg'}), 400
    result = CommentsBusiness.remove_by_id(
        ObjectId(_id), user_ID)
    return jsonify({'response': result}), 200
