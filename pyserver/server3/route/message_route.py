# -*- coding: UTF-8 -*-
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import request
from flask_jwt_extended import create_access_token
from mongoengine import DoesNotExist
from flask_jwt_extended import jwt_required, get_jwt_identity

from server3.repository import config
from server3.service import message_service
from server3.utility import json_utility

PREFIX = '/message'
message_app = Blueprint("message_app", __name__, url_prefix=PREFIX)


@message_app.route('', methods=['POST'])
@jwt_required
def create_message():
    if not request.json \
            or 'message_type' not in request.json:
        return jsonify({'response': 'insufficient arguments'}), 400
    data = request.get_json()
    #  用于确定 message 的类型

    message_type = data['message_type']
    sender = data.get('sender', None)
    title = data.get('title')
    content = data.get('content', None)
    receivers = data.get('receivers', None)
    message_service.create_message(sender, message_type,
                                   receivers, title=title,
                                   content=content)
    return jsonify({'response': 'create message success'}), 200


@message_app.route('', methods=['GET'])
@jwt_required
def get_message():
    user_ID = get_jwt_identity()
    # user_id = request.args.get("user_obj_id")
    messages = message_service.get_by_user_ID(user_ID)
    return jsonify({'response': messages}), 200


@message_app.route('/read', methods=['PUT'])
@jwt_required
def read_message():
    data = request.get_json()
    print('data')
    print(data)
    receiver_id = data['receiver_id']
    user_ID = get_jwt_identity()
    message_service.read_message(user_ID, receiver_id)
    return jsonify({'response': 'update success'}), 200