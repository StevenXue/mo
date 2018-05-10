# -*- coding: UTF-8 -*-
"""
Blueprint for user

新增 用户收藏api，取消收藏api

Author: Zhaofeng Li
Date: 2017.05.22
"""
import os
import json
import requests
import jwt
import time
import hashlib
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import request
from flask import send_from_directory
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
from server3.service.request_answer_service import RequestAnswerService
from server3.business.request_answer_business import RequestAnswerBusiness
from server3.constants import UPDATE_USER_INFO_SK

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
        added_user = user_service.register(user_ID, password, phone, code,
                                           **data)
        added_user = json_utility.convert_to_json(added_user.to_mongo())
        added_user.pop('password')

        # 为新用户创建tutorial project
        from server3.service.project_service import ProjectService
        from server3.service.app_service import AppService
        user_token = create_access_token(identity=added_user["user_ID"])
        AppService.create_tutorial_project(
            user_ID=added_user["user_ID"],
            user_token=user_token
        )

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
        user = user_service.reset_password(phone, message_id, code,
                                           new_password)
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
        if not user:
            return jsonify({'response': 'Bad username or password'}), 400

        user_obj = json_utility.convert_to_json(user.to_mongo())
        user_obj.pop('password')
        if hasattr(user, "avatar"):
            del user.avatar
    except DoesNotExist as e:
        return jsonify({'response': '%s: %s' % (str(
            DoesNotExist), e.args)}), 400

    # Identity can be any data that is json serializable
    response = {
        'response': {'token': create_access_token(identity=user.user_ID),
                     'user': user_obj}}
    return jsonify(response), 200


@user_app.route('/forgot', methods=['GET'])
def forgot():
    email = request.args.get('email', None)
    try:
        user = user_service.forgot_send(email)
        # user_obj.pop('password')
    except DoesNotExist as e:
        return jsonify({'response': '%s: %s' % (str(
            DoesNotExist), e.args)}), 400
    if not user:
        return jsonify({'response': 'Bad email'}), 400
    # Identity can be any data that is json serializable
    response = {'response': 'ok'}
    return jsonify(response), 200


@user_app.route('/newpassword', methods=['GET'])
def newpassword():
    password = request.args.get('password', None)
    email = request.args.get('email', None)
    hashEmail = request.args.get('hashEmail', None)
    try:
        user = user_service.newpassword_send(password, email, hashEmail)
        # user_obj.pop('password')
    except DoesNotExist as e:
        return jsonify({'response': '%s: %s' % (str(
            DoesNotExist), e.args)}), 400
    if not user:
        return jsonify({'response': 'Bad email'}), 400
    # Identity can be any data that is json serializable
    response = {'response': 'ok'}
    return jsonify(response), 200

@user_app.route('/haveReset', methods=['GET'])
def haveReset():
    email = request.args.get('email', None)
    hashEmail = request.args.get('hashEmail', None)
    try:
        user = user_service.have_hashEmail(email, hashEmail)
        # user_obj.pop('password')
    except DoesNotExist as e:
        return jsonify({'response': '%s: %s' % (str(
            DoesNotExist), e.args)}), 400
    if not user:
        return jsonify({'response': 'Bad email'}), 400
    # Identity can be any data that is json serializable
    response = {'response': {'token': create_access_token(identity=user.user_ID)}}
    return jsonify(response), 200


@user_app.route('/tourtip', methods=['GET'])
def tourtip():
    user_ID = request.args.get('user_ID', None)
    try:
        user = user_service.check_tourtip(user_ID)
        user_obj = json_utility.convert_to_json(user.to_mongo())
        user_obj.pop('password')
    except DoesNotExist as e:
        return jsonify({'response': '%s: %s' % (str(
            DoesNotExist), e.args)}), 400
    if not user:
        return jsonify({'response': 'Bad email'}), 400
    # Identity can be any data that is json serializable
    response = {'response': {'user': user_obj}}
    return jsonify(response), 200


@user_app.route('/notourtip', methods=['GET'])
def notourtip():
    user_ID = request.args.get('user_ID', None)
    try:
        user = user_service.no_tourtip(user_ID)
        user_obj = json_utility.convert_to_json(user.to_mongo())
        user_obj.pop('password')
    except DoesNotExist as e:
        return jsonify({'response': '%s: %s' % (str(
            DoesNotExist), e.args)}), 400
    if not user:
        return jsonify({'response': 'Bad email'}), 400
    # Identity can be any data that is json serializable
    response = {'response': {'user': user_obj}}
    return jsonify(response), 200


@user_app.route('/learning', methods=['GET'])
def learning():
    user_ID = request.args.get('user_ID', None)
    try:
        user = user_service.check_learning(user_ID)
        user_obj = json_utility.convert_to_json(user.to_mongo())
        user_obj.pop('password')
    except DoesNotExist as e:
        return jsonify({'response': '%s: %s' % (str(
            DoesNotExist), e.args)}), 400
    if not user:
        return jsonify({'response': 'Bad email'}), 400
    # Identity can be any data that is json serializable
    response = {'response': {'user': user_obj}}
    return jsonify(response), 200


@user_app.route('/nolearning', methods=['GET'])
def nolearning():
    user_ID = request.args.get('user_ID', None)
    try:
        user = user_service.no_learning(user_ID)
        user_obj = json_utility.convert_to_json(user.to_mongo())
        user_obj.pop('password')
    except DoesNotExist as e:
        return jsonify({'response': '%s: %s' % (str(
            DoesNotExist), e.args)}), 400
    if not user:
        return jsonify({'response': 'Bad email'}), 400
    # Identity can be any data that is json serializable
    response = {'response': {'user': user_obj}}
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
                'token': create_access_token(identity=user.user_ID),
                'user': json_utility.convert_to_json(user.to_mongo())}}
            return jsonify(response), 200
    except Error as e:
        print("e.args[0]", e.args[0])
        return jsonify({
            "response": {
                "error": e.args[0]
            }
        }), 400


@user_app.route('/two_step_vfc', methods=['POST'])
@jwt_required
def two_step_vfc():
    user_ID = get_jwt_identity()
    data = request.get_json()
    print(data)
    check_type = data.pop("checkType")
    check_value = data.pop("checkValue")
    code = data.pop("code")

    try:
        result = False
        if check_type == 'phone':
            result = user_service.verify_code(code=code, phone=check_value)
        elif check_type == 'email':
            user = UserBusiness.get_by_user_ID(user_ID)
            if code and code == user.emailCaptcha:
                result = True
        if result:
            # 默认一周
            expire_time = time.time() + 604800
            response = {'response': {
                'tokenForUpdateInfo': jwt.encode({'user_ID': user_ID,
                                                  'expireTime': expire_time},
                                                 UPDATE_USER_INFO_SK,
                                                 algorithm='HS256'),
            }}
            return jsonify(response), 200
    except Error as e:
        return jsonify({
            "response": '验证码错误，请重新输入'}), 400


# 发送验证码到邮箱
@user_app.route('/send_verification_code_to_email/<email>', methods=['get'])
@jwt_required
def send_verification_code_to_email(email):
    user_ID = get_jwt_identity()
    try:
        from server3.business.user_business import UserBusiness
        from server3.service.user_service import UserService
        UserService.send_captcha_to_email(user_ID, email)
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
    action = data.pop("action")
    entity = data.pop("entity")

    result = UserService.action_entity(
        user_ID=user_ID, entity_id=entity_id, action=action, entity=entity)

    if result:
        return jsonify({
            'message': "success",
            'response': {
                "entity": json_utility.convert_to_json(
                    result.entity.to_mongo()),
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
            each_request.answer_number = RequestAnswerBusiness. \
                answer_number_of_user_request(each_request.id)
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
    user = UserBusiness.get_by_user_ID(user_ID=user_ID)
    user_info = json_utility.convert_to_json(user.to_mongo())
    return jsonify({'response': user_info}), 200


# 获取用户的统计信息， 收藏了多少app， 发布了多少需求
@user_app.route('/user_statistics', methods=['GET'])
@jwt_required
def get_user_statistics():
    from server3.business.user_request_business import UserRequestBusiness
    user_ID = request.args.get("user_ID", get_jwt_identity())

    apps = UserBusiness.get_action_entity(
        user_ID=user_ID, action_entity="favor_apps",
        page_no=1, page_size=1)
    favor_apps_count = apps.count
    user = UserBusiness.get_by_user_ID(user_ID)
    requests_count = UserRequestBusiness.request_number_of_this_user(user)
    return jsonify({'response': {
        "favor_apps_count": favor_apps_count,
        "requests_count": requests_count
    }}), 200


@user_app.route('/statistics', methods=['GET'])
@jwt_required
def get_statistics():
    user_ID = get_jwt_identity()
    page_no = int(request.args.get('page_no', 1))
    page_size = int(request.args.get('page_size', 5))
    action = request.args.get("action")
    entity_type = request.args.get("entity_type")
    statistics = UserService.get_statistics(user_ID, page_no, page_size, action,
                                            entity_type)

    for _object in statistics.objects:
        _object.app_obj_user_ID = _object.app.user.user_ID
    return jsonify({
        'response': {
            "objects": json_utility.objs_to_json_with_args(statistics.objects, ["app", "caller"]),
            "page_size": statistics.page_size,
            "page_no": statistics.page_no,
            "count": statistics.count,
        }
    })


# 用户更改基本信息 性别，头像
@user_app.route('', methods=['PUT'])
@jwt_required
def update_user():
    user_ID = get_jwt_identity()
    data = request.get_json()
    # 检查data是否在 ["email", "phone", "gender","avatar"]
    lists = ["gender", "avatar"]
    for key, value in data.items():
        if key not in lists:
            return jsonify({'response': 'error arguments'}), 400
    user = UserBusiness.update_by_user_ID(user_ID=user_ID, update=data)
    return jsonify({'response': {
        "user": json_utility.convert_to_json(user.to_mongo())
    }}), 200


# 用户更改重要信息 邮箱，手机号, 密码
@user_app.route('/account', methods=['PUT'])
@jwt_required
def update_user_account():
    user_ID = get_jwt_identity()
    data = request.get_json()
    token_for_update_info = data['tokenForUpdateInfo']
    phone = data.get('phone', None)
    email = data.get('email', None)
    password = data.get('password', None)
    captcha = data.get('captcha', None)
    payload = jwt.decode(token_for_update_info, UPDATE_USER_INFO_SK,
                         algorithm='HS256')
    if payload['user_ID'] != user_ID or payload['expireTime'] < time.time():
        return jsonify({'response': {'error': 'tokenError'}}), 400
    elif phone:
        # 更改手机
        # 验证手机 验证码
        try:
            if UserBusiness.get_by_phone(phone):
                return jsonify({
                    "response": {'error': "手机号已被注册，请更换手机号"}
                }), 400
            res = user_service.verify_code(code=captcha, phone=phone)
            user = UserBusiness.get_by_user_ID(user_ID)
            user.phone = phone
            user.save()
            return jsonify({'response': {
                "user": json_utility.convert_to_json(user.to_mongo())
            }}), 200
        except Error as e:
            return jsonify({
                "response": {'error': "验证码错误"}
            }), 400
    elif email:
        # 更改邮箱
        # 验证邮箱 验证码
        if UserBusiness.get_by_email(email):
            return jsonify({
                "response": {'error':  "邮箱已被注册，请更换邮箱"}
            }), 400
        try:
            user = UserService.update_user_email(user_ID, email, captcha)
            return jsonify({'response': {
                "user": json_utility.convert_to_json(user.to_mongo())
            }}), 200
        except Error as e:
            return jsonify({
                "response":  {'error':e.args[0]}
            }), 400
    elif password:
        UserBusiness.update_password(user_ID, password)
    else:
        return jsonify({'response': {'error': 'unkownError'}}), 400
    return jsonify({'response': 'ok'}), 200


# # 用户更改头像
# @user_app.route('/avatar', methods=['POST'])
# @jwt_required
# def update_user_avatar():
#     user_ID = get_jwt_identity()
#     data = request.get_json()
#     base64_str = data.get('dataUrl', None)
#     UserService.update_user_avatar(user_ID, base64_str)
#     return jsonify({'response': 'ok'}), 200


@user_app.route('/avatar/<path:filename>', methods=['GET'])
def update_user_avatar(filename):
    if os.path.isfile(f'../user_avatar/{filename}'):
        return send_from_directory('../user_avatar', filename)
    else:
        hash_value = int(hashlib.md5(filename.encode('utf-8')).hexdigest()[:8], 16)
        filename = str(hash_value % 6)+'.jpg'
        return send_from_directory('../user_avatar', filename)