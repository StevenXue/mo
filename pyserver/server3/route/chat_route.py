# -*- coding: UTF-8 -*-
"""
Blueprint for chat

Author: Bingwei Chen
Date: 2018.01.28
"""

from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request
import synonyms

from server3.service import user_service
from server3.business import api_business
from server3.business import user_business
from server3.utility import json_utility

PREFIX = '/chat'

chat_app = Blueprint("chat_app", __name__, url_prefix=PREFIX)

# TODO 全部移植到其他routes


@chat_app.route('/intent', methods=['post'])
def get_intent():
    """
    通过用户输入, 用户提供的意图list，匹配到用户意图

    用户意图有 使用服务
    :return: label
    :rtype: str
    """
    data = request.get_json()
    content = data.pop('content')
    intent_list = data.get("intent_list")
    # intent_list =[
    #     {
    #         "value": 1,
    #         "label": '使用平台服务',
    #         "trigger": "WebChatId.requirement.text",
    #     },
    # ]
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







# @chat_app.route('/get_matched_apis', methods=['GET'])
# def get_matched_apis():
#     content = request.args.get('content')
#     apis = api_business.get_all()
#     #  比对打分
#     score_list = []
#     for api in apis:
#         api_json = api.to_mongo()
#         score_list.append({
#             **api_json,
#             "score": synonyms.compare(content, api.keyword, seg=True)
#         })
#     score_list = sorted(score_list, key=lambda item: -item["score"])
#     # 最大值
#     max_score = score_list[0]["score"]
#     if max_score < 0.5:
#         return jsonify({'response': {
#            "message": "no api matched",
#            "status": False
#         }}), 200
#     score_list = score_list[:5]
#     api_list = json_utility.convert_to_json(score_list[:5])
#
#     return jsonify({'response': {
#         "api_list": api_list,
#         "status": True
#     }}), 200
#
#
# @chat_app.route('/get_api_detail', methods=['GET'])
# def get_api_detail():
#     api_id = request.args.get('api_id')
#     api = api_business.get_by_api_id(api_id=api_id)
#     return jsonify({'response': api}), 200
#
#
# @chat_app.route('/api_predict', methods=['POST'])
# def api_predict():
#     # api_id = request.args.get('api_id')
#     data = request.get_json()
#     print("data", data)
#     api_id = data["api_id"]
#     input = data["input"]
#     api = api_business.get_by_api_id(api_id=api_id)
#     # filled_api_detail = data["filled_api_detail"]
#
#     if api.status == 0:
#         return jsonify({'response': api.fake_response}), 200
#     elif api.status == 1:
#         # result =
#         return jsonify({'response': "真实api结果"}), 200
#
#
# @chat_app.route('/favor_api', methods=['POST'])
# def favor_api():
#     user_ID = request.args.get("user_ID")
#     api_id = request.args.get("api_id")
#     result = user_service.favor_api(user_ID=user_ID, api=api_id)
#     if result:
#         return jsonify({'response': "success"}), 200
