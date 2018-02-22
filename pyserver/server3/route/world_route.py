# -*- coding: UTF-8 -*-
"""
Blueprint for world

Author: Bingwei Chen
Date: 2018.01.28

world_route 即前端世界频道



"""

import sys
from flask import Blueprint
from flask import jsonify
from flask import request

from server3.service import user_service, world_service
from server3.business import world_business, user_business
from server3.utility import json_utility
from server3.constants import Error, Warning

PREFIX = '/world_message'

world_app = Blueprint("world_app", __name__, url_prefix=PREFIX)


@world_app.route('', methods=['POST'])
def send():
    """
    用户发送 世界频道消息
    :return:
    :rtype:
    """
    data = request.get_json()
    user_ID = data.pop("user_ID")
    channel = data.pop("channel")
    message = data.pop("message")
    result = world_service.use_send(user_ID, channel, message)
    if result:
        result = json_utility.convert_to_json(result.to_mongo())
        return jsonify({
            "response": result
        }), 200


@world_app.route('', methods=['GET'])
def get():
    data = request.get_json()
    channel = data.pop("channel")
    world_messages = world_business.get(channel=channel)
    if world_messages:
        world_messages = json_utility.me_obj_list_to_dict_list(world_messages)
        return jsonify({
            "response": world_messages
        }), 200
