# -*- coding: UTF-8 -*-
"""
Blueprint for chat

Author: Bingwei Chen
Date: 2018.01.28
"""

from flask import Blueprint
from flask import jsonify
from flask import request
from server3.constants import ENV
if ENV == 'PROD':
    import synonyms

PREFIX = '/chat'

chat_app = Blueprint("chat_app", __name__, url_prefix=PREFIX)


@chat_app.route('/intent', methods=['post'])
def get_intent():
    """
    通过用户输入, 用户提供的意图list，匹配到用户意图

    用户意图有 使用服务

    # intent_list =[
    #     {
    #         "value": 1,
    #         "label": '使用平台服务',
    #         "trigger": "WebChatId.requirement.text",
    #     },
    # ]

    :return: label
    :rtype: str
    """
    if ENV != 'PROD':
        import synonyms
    data = request.get_json()
    content = data.pop('content')
    intent_list = data.get("intent_list")

    for index, intent in enumerate(intent_list):
        intent["score"] = synonyms.compare(content, intent["label"], seg=True)
        intent_list[index] = intent
    print("intent_list", intent_list)
    intent_list = sorted(intent_list, key=lambda item: -item["score"])
    max_score = intent_list[0]["score"]

    if max_score < 0.5:
        # 调用图灵机器人
        return jsonify({
            "response": {
                "type": "tuling",
                "message": "没有匹配到服务，图灵机器人回答你， hello"
            }
        }), 200
    return jsonify({
        "response": {
            "type": "intent",
            **intent_list[0],
            "message": intent_list[0]["label"],
            "trigger": intent_list[0]["trigger"]
        }
    }), 200

