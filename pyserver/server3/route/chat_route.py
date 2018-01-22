# -*- coding: UTF-8 -*-
"""
Blueprint for analysis

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


@chat_app.route('/get_matched_apis', methods=['GET'])
def get_matched_apis():
    content = request.args.get('content')
    apis = api_business.get_all()
    #  比对打分
    score_list = []
    for api in apis:
        api_json = api.to_mongo()
        score_list.append({
            **api_json,
            "score": synonyms.compare(content, api.keyword, seg=True)
        })
    score_list = sorted(score_list, key=lambda item: -item["score"])
    # 最大值
    max_score = score_list[0]["score"]
    if max_score < 0.5:
        return jsonify({'response': {
           "message": "no api matched",
           "status": False
        }}), 200
    score_list = score_list[:5]
    api_list = json_utility.convert_to_json(score_list[:5])

    return jsonify({'response': {
        "api_list": api_list,
        "status": True
    }}), 200


@chat_app.route('/get_api_detail', methods=['GET'])
def get_api_detail():
    api_id = request.args.get('api_id')
    api = api_business.get_by_api_id(api_id=api_id)
    return jsonify({'response': api}), 200


@chat_app.route('/api_predict', methods=['POST'])
def api_predict():
    # api_id = request.args.get('api_id')
    data = request.get_json()
    print("data", data)
    api_id = data["api_id"]
    input = data["input"]
    api = api_business.get_by_api_id(api_id=api_id)
    # filled_api_detail = data["filled_api_detail"]

    if api.status == 0:
        return jsonify({'response': api.fake_response}), 200
    elif api.status == 1:
        # result =
        return jsonify({'response': "真实api结果"}), 200


@chat_app.route('/favor_api', methods=['POST'])
def favor_api():
    user_ID = request.args.get("user_ID")
    api_id = request.args.get("api_id")
    result = user_service.add_favor_api(user_ID=user_ID, api=api_id)
    if result:
        return jsonify({'response': "success"}), 200
