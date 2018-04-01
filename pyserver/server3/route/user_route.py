# -*- coding: UTF-8 -*-
"""
Blueprint for user

新增 用户收藏api，取消收藏api

Author: Zhaofeng Li
Date: 2017.05.22
"""
import json
import requests

from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import request
from flask_jwt_extended import create_access_token
from mongoengine import DoesNotExist
from flask_jwt_extended import jwt_required, get_jwt_identity

from server3.repository import config
from server3.business import user_business
from server3.service import user_service
from server3.service import project_service
from server3.utility import json_utility
from server3.constants import Error
from server3.service.user_service import UserService
from server3.business.user_business import UserBusiness
from server3.business.statistics_business import StatisticsBusiness
from server3.service import request_answer_service

PREFIX = '/user'

user_app = Blueprint("user_app", __name__, url_prefix=PREFIX)


# appKey = '26eeaa3d279c322e84f95441'
# masterSecret = 'f024677b9cc3d1eff4148410'
# auth_string = appKey + ':' + masterSecret

# 发送验证码
@user_app.route('/send_verification_code/<phone>', methods=['get'])
def send_verification_code(phone):
    try:
        user_service.send_verification_code(phone)
        return jsonify({
            "response": "success"
        }), 200
    except Error as e:
        print("e.args[0]", e.args[0])
        return jsonify({
            "response": {
                "error": e.args[0]
            }
        }), 400


@user_app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    user_ID = data['user_ID']
    password = data['password']
    code = data.pop('code')
    captcha = data.pop("captcha")
    phone = data.pop('phone')
    data.pop('user_ID')
    data.pop('password')
    if user_ID is None or password is None or code is None:
        return jsonify({'response': 'invalid user or password'}), 400
    try:
        added_user = user_service.register(user_ID, password, phone, code, **data)
        added_user = json_utility.convert_to_json(added_user.to_mongo())
        added_user.pop('password')
        return jsonify({'response': added_user}), 200
    except Error as e:
        print("e.args[0]", e.args[0])
        return jsonify({
            "response": {"error": e.args[0]}
        }), 400


# TODO 删掉 验证手机号和验证码是否匹配 (不存在单独验证，需要与相应动作关联）
# @user_app.route('/verify_code', methods=['post'])
# def verify_code():
#     data = request.get_json()
#     try:
#         result = user_service.verify_code(code=data["code"], phone=data["phone"])
#     except Error as e:
#         print("Error", e)
#         print("e.args[0]", e.args[0])
#         return jsonify({
#             "message": e.args[0]
#         }), 300
#     if result:
#         return jsonify({
#             "response": True,
#         }), 200


@user_app.route('/reset_password', methods=['post'])
def reset_password():
    """
    提供更改密码接口
    :return:
    :rtype:
    """
    data = request.get_json()
    phone = data.pop("phone")
    message_id = data.pop("message_id")
    code = data.pop("code")
    new_password = data.pop("new_password")
    try:
        user = user_service.reset_password(phone, message_id, code, new_password)
    except Error as e:
        return jsonify({
            "message": e.args[0]
        })
    if user:
        user = json_utility.convert_to_json(user.to_mongo())
        return jsonify({
            "response": user
        })


# Provide a method to create access tokens. The create_access_token()
# function is used to actually generate the token
@user_app.route('/login', methods=['POST'])
def login():
    user_ID = request.json.get('user_ID', None)
    password = request.json.get('password', None)
    try:
        user = user_service.authenticate(user_ID, password)
        user_obj = json_utility.convert_to_json(user.to_mongo())
        user_obj.pop('password')
    except DoesNotExist as e:
        return jsonify({'response': '%s: %s' % (str(
            DoesNotExist), e.args)}), 400
    if not user:
        return jsonify({'response': 'Bad username or password'}), 400
    # Identity can be any data that is json serializable
    response = {'response': {'token': create_access_token(identity=user),
                             'user': user_obj}}
    return jsonify(response), 200


@user_app.route('/login_with_phone', methods=['POST'])
def login_with_phone():
    """
    通过手机号登录，
    :return:
    :rtype:
    """
    data = request.get_json()
    phone = data.pop("phone")
    # message_id = data.pop("message_id")
    code = data.pop("code")
    try:
        result = user_service.verify_code(code=code, phone=phone)
        if result:
            user = user_business.get_by_phone(phone=phone)
            response = {'response': {
                'token': create_access_token(identity=user),
                'user': json_utility.convert_to_json(user.to_mongo())}}
            return jsonify(response), 200
    except Error as e:
        print("e.args[0]", e.args[0])
        return jsonify({
            "response": {
                "error": e.args[0]
            }
        }), 400


# @user_app.route('/favor_api', methods=['PUT'])
# def favor_api():
#     """
#     在用户和api下都存一份
#     用户存api_id
#     api存 user_ID
#     :return:
#     :rtype:
#     """
#     user_ID = request.json.get('user_ID', None)
#     api_id = request.json.get('api_id', None)
#     result = user_service.favor_api(user_ID=user_ID, api_id=api_id)
#     if result:
#         result = json_utility.convert_to_json(result)
#         return jsonify({
#             'message': "success",
#             'response': result
#         }), 200
#     else:
#         return jsonify({'response': "failed"}), 400
#
#
# @user_app.route('/star_api', methods=['PUT'])
# def star_api():
#     """
#     在用户和api下都存一份
#     用户存api_id
#     api存 user_ID
#     :return:
#     :rtype:
#     """
#     user_ID = request.json.get('user_ID', None)
#     api_id = request.json.get('api_id', None)
#     result = user_service.star_api(user_ID=user_ID, api_id=api_id)
#     if result:
#         result = json_utility.convert_to_json(result)
#         return jsonify({
#             'message': "success",
#             'response': result
#         }), 200
#     else:
#         return jsonify({'response': "failed"}), 400


# new routes
# TODO 写获取统一接口 传入 type: favor/star/used, entity: app/module/dataset/request
# TODO 写统一执行动作 type: favor/star, entity: app/module/dataset/request
@user_app.route('/action_entity/<entity_id>', methods=['PUT'])
@jwt_required
def set_action_entity(entity_id):
    """
    在用户和api下都存一份
    用户存api_id
    api存 user_ID
    :return:
    :rtype:
    """
    user_ID = get_jwt_identity()
    data = request.get_json()
    print('data')
    print(data)
    action = data.pop("action")
    entity = data.pop("entity")

    result = UserService.action_entity(
        user_ID=user_ID, entity_id=entity_id, action=action, entity=entity)

    if result:
        return jsonify({
            'message': "success",
            'response': {
                "entity": json_utility.convert_to_json(result.entity.to_mongo()),
                "user": json_utility.convert_to_json(result.user.to_mongo())
            }
        }), 200
    else:
        return jsonify({'response': "failed"}), 400


@user_app.route('/action_entity', methods=['GET'])
@jwt_required
def get_action_entity():
    user_ID = request.args.get("user_ID", get_jwt_identity())
    action_entity = request.args.get("action_entity")
    page_no = int(request.args.get('page_no', 1))
    page_size = int(request.args.get('page_size', 5))
    type = request.args.get('type', None)
    search_query = request.args.get('search_query', None)
    apps = UserBusiness.get_action_entity(
        user_ID=user_ID, action_entity=action_entity, type=type,
        page_no=page_no, page_size=page_size, search_query=search_query)
    if action_entity != 'request_star':
        for app in apps.objects:
            app.user_ID = app.user.user_ID
    else:
        for each_request in apps.objects:
            each_request.answer_number = \
                request_answer_service.get_all_answer_of_this_user_request(
                    each_request.id, get_number=True)
            each_request.user_ID = each_request.user.user_ID
    return jsonify({
        'response': {
            "objects": json_utility.me_obj_list_to_json_list(apps.objects),
            "page_size": apps.page_size,
            "page_no": apps.page_no,
            "count": apps.count,
        }
    })


@user_app.route('/profile/<user_ID>', methods=['GET'])
def get_user_info(user_ID):
    result = UserService.get_user_info(user_ID=user_ID)
    print('result')
    print(result)
    return jsonify({'response': result}), 200


@user_app.route('/statistics', methods=['GET'])
@jwt_required
def get_statistics():
    user_ID = get_jwt_identity()
    page_no = int(request.args.get('page_no', 1))
    page_size = int(request.args.get('page_size', 5))

    action = request.args.get("action")
    entity_type = request.args.get("entity_type")

    user_obj = UserBusiness.get_by_user_ID(user_ID=user_ID)
    statistics = StatisticsBusiness.get_pagination(
        query={
            "action": action,
            "entity_type": entity_type,
            "caller": user_obj
        },
        page_no=page_no, page_size=page_size)

    # for object in statistics.objects:
    #     # print("tom", json_utility.convert_to_json(object.app.to_mongo()))
    #     # object.app_obj = "111"
    #     app = json.dumps(object.app.to_mongo())#json_utility.convert_to_json(object.app.to_mongo())
    #     object.app_obj = app
    #
    #     # object = json_utility.convert_to_json(object.to_mongo())
    #     # object["app_obj"] = app
    print("statistics.objects", statistics.objects)

    return jsonify({
        'response': {
            "objects": json_utility.objs_to_json_with_args(statistics.objects, ["app", "caller"]),
            "page_size": statistics.page_size,
            "page_no": statistics.page_no,
            "count": statistics.count,
        }
    })


# 用户更改基本信息 邮箱，手机号, 性别
@user_app.route('', methods=['PUT'])
@jwt_required
def update_user():
    user_ID = get_jwt_identity()
    data = request.get_json()
    # 检查data是否在 ["email", "phone", "gender"]
    lists = ["email", "phone", "gender"]
    for key, value in data.items():
        if key not in lists:
            return jsonify({'response': 'error arguments'}), 400
    user = UserBusiness.update_by_user_ID(user_ID=user_ID, update=data)
    print("user", user)
    return jsonify({'response': {
        "user": json_utility.convert_to_json(user.to_mongo())
    }}), 200
