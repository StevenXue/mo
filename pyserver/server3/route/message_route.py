# -*- coding: UTF-8 -*-
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import request
from flask_jwt_extended import create_access_token
from mongoengine import DoesNotExist

from server3.repository import config
from server3.service import message_service
from server3.utility import json_utility

PREFIX = '/message'
message_app = Blueprint("message_app", __name__, url_prefix=PREFIX)


@message_app.route('', methods=['POST'])
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
def get_message():
    user_id = request.args.get("user_obj_id")
    messages = message_service.get_by_user_id(user_id)
    return jsonify({'response': messages}), 200
