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

from server3.service.world_service import WorldService
from server3.business.world_business import WorldBusiness
from server3.utility import json_utility
# from server3.constants import Error, Warning

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
    result = WorldService.user_send(user_ID, channel, message)
    if result:
        result = json_utility.convert_to_json(result.to_mongo())
        return jsonify({
            "response": result
        }), 200


@world_app.route('', methods=['GET'])
def get():
    data = request.get_json()
    channel = data.pop("channel")
    page_no = int(request.args.get('page_no', 1))
    page_size = int(request.args.get('page_size', 50))
    world_messages = WorldBusiness.get_pagination(
        query={"channel": channel},
        page_no=page_no, page_size=page_size)
    if world_messages:
        return jsonify({
            "response": {
                "objects": json_utility.me_obj_list_to_dict_list(world_messages.objects)
            }
        }), 200
