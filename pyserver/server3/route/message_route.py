# -*- coding: UTF-8 -*-
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import request
from flask_jwt_extended import create_access_token
from mongoengine import DoesNotExist
from flask_jwt_extended import jwt_required, jwt_optional, get_jwt_identity

from server3.repository import config
from server3.utility import json_utility
from server3.service.message_service import MessageService

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
    # receivers is a list
    receivers = data.get('receivers', [])
    MessageService.create_message(sender, message_type,
                                  receivers, title=title,
                                  content=content)
    return jsonify({'response': 'create message success'}), 200


@message_app.route('', methods=['GET'])
@jwt_optional
def get_message():
    # 返回用户的所有的message
    user_ID = get_jwt_identity()
    # 如果用户没登陆，返回空
    if user_ID is None:
        return jsonify({'response': {'messages': [],
                                     'total_number': 0}}), 200
    # 目前先返回最近的100条，以后做消息中心了再做翻页
    page_no = int(request.args.get("pageNo", 1))
    page_size = int(request.args.get("pageSize", 100))
    messages, total_number = MessageService.get_by_user_ID(user_ID, page_no,
                                                           page_size)
    return jsonify({'response': {'messages': messages,
                                 'total_number': total_number}}), 200


@message_app.route('/read', methods=['PUT'])
@jwt_required
def read_message():
    data = request.get_json()
    receiver_id = data['receiver_id']
    user_ID = get_jwt_identity()
    MessageService.read_message(user_ID, receiver_id)
    return jsonify({'response': 'update success'}), 200
