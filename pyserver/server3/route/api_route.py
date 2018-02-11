# -*- coding: UTF-8 -*-
"""
Blueprint for api

Author: Bingwei Chen
Date: 2018.01.28

api_route 即前端app应用，本文件将实现所有关于app应用的服务
新增api，获取单个api，获取api列表，修改api ok
关键字匹配api


点赞数 自己count
获取自己使用过的api，自己收藏的api
"""

import sys
from flask import Blueprint
from flask import jsonify
from flask import request
import synonyms

from server3.service import user_service, api_service
from server3.business import api_business, user_business
from server3.entity.api import ApiGetType
from server3.utility import json_utility
from server3.constants import Error, Warning
PREFIX = '/apis'

api_app = Blueprint("api_app", __name__, url_prefix=PREFIX)


@api_app.route('', methods=['POST'])
def add():
    """
    :return: 
    :rtype: 
    """
    data = request.get_json()
    try:
        user_ID = data.pop("user_ID")
        name = data.pop("name")
        user = user_business.get_by_user_ID(user_ID)
        result = api_business.add(name=name, user=user, **data)
        result = json_utility.convert_to_json(result.to_mongo())
        return jsonify({
            "response": result
        }), 200
    except KeyError:
        return jsonify({
            "response": {"message": "no enough params"}
        }), 300
    except:
        print("Unexpected error:", sys.exc_info()[0])
        raise


@api_app.route('', methods=['GET'])
def get_api_list():
    """
    获取用户 自己使用过的apis，自己收藏的apis, 自己star的apis, 带搜索关键字的
    :return:
    :rtype:
    """
    page_no = int(request.args.get('page_no', 1))
    page_size = int(request.args.get('page_size', 5))
    search_query = request.args.get('search_query', None)
    get_type = request.args.get('get_type', ApiGetType.all)
    user_ID = request.args.get('user_ID', None)
    default_max_score = float(request.args.get('max_score', 0.4))

    try:
        api_list = api_service.get_api_list(
            get_type=get_type,
            search_query=search_query,
            user_ID=user_ID,
            page_no=page_no,
            page_size=page_size,
            default_max_score=default_max_score
        )
    except Warning as e:
        return jsonify({
            "response": [],
            "message": e.args[0]["hint_message"]
        }), 200
    except Error as e:
        return jsonify({
            "message": e.args[0]["hint_message"]
        }), 404
    else:
        if get_type == ApiGetType.chat:
            api_list = json_utility.convert_to_json(api_list)
        else:
            api_list = json_utility.me_obj_list_to_json_list(api_list)
        return jsonify({
            "response": api_list
        }), 200


@api_app.route('/<api_id>', methods=['GET'])
def get_api(api_id):
    api = api_business.get_by_api_id(api_id)
    api = json_utility.convert_to_json(api.to_mongo())
    return jsonify({
        "response": api
    }), 200


@api_app.route('/update_api', methods=['PUT'])
def update_api():
    data = request.get_json()
    try:
        api_id = data.pop("api_id")
        result = api_business.update_by_id(api_id=api_id, **data)
        result = json_utility.convert_to_json(result.to_mongo())
        return jsonify({
            "response": result
        }), 200

    except KeyError:
        return jsonify({
            "response": {"message": "no enough params"}
        }), 300
    except:
        print("Unexpected error:", sys.exc_info()[0])
        raise


@api_app.route('/predict', methods=['POST'])
def api_predict():
    # api_id = request.args.get('api_id')
    data = request.get_json()
    api_id = data["api_id"]
    input = data["input"]
    api = api_business.get_by_api_id(api_id=api_id)
    # filled_api_detail = data["filled_api_detail"]

    if api.status == 0:
        return jsonify({'response': api.fake_response}), 200
    elif api.status == 1:
        # result =
        return jsonify({'response': "真实api结果"}), 200

# 使用统一 get_api_list
# @api_app.route('/get_matched_apis', methods=['GET'])
# def get_matched_apis():
#     """
#     通过用户关键字 给出用户匹配的api
#     :return:
#     :rtype:
#     """
#     content = request.args.get('content')
#     page_no = int(request.args.get('page_no', 1))
#     page_size = int(request.args.get('page_size', 5))
#     default_max_score = int(request.args.get('max_score', 0.4))
#
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
#     if max_score < default_max_score:
#         return jsonify({'response': {
#             "message": "no api matched",
#             "status": False
#         }}), 200
#     start = (page_no - 1) * page_size
#     end = page_no * page_size
#     score_list = score_list[start:end]
#     api_list = json_utility.convert_to_json(score_list)
#
#     return jsonify({'response': {
#         "api_list": api_list,
#         "status": True
#     }}), 200

# 使用统一 get_api_list
# @api_app.route('/get_favor_apis', methods=['GET'])
# def get_favor_apis():
#     user_ID = request.args.get('user_ID', None)
#     page_no = int(request.args.get('page_no', 1))
#     page_size = int(request.args.get('page_size', 5))
#     favor_apis = api_service.get_favor_apis(
#         user_ID=user_ID,
#         page_no=page_no,
#         page_size=page_size)
#
#     if favor_apis:
#         favor_apis = json_utility.me_obj_list_to_json_list(favor_apis)
#         return jsonify({'response': {
#             "favor_apis": favor_apis,
#             "status": True
#         }}), 200


# @api_app.route('/get_used_apis', methods=['GET'])
# def get_favor_apis():
#     user_ID = request.args.get('user_ID', None)
#     page_no = int(request.args.get('page_no', 1))
#     page_size = int(request.args.get('page_size', 5))
#
#     favor_apis = api_service.get_favor_apis(
#         user_ID=user_ID,
#         page_no=page_no,
#         page_size=page_size)
