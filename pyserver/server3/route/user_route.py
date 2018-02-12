# -*- coding: UTF-8 -*-
"""
Blueprint for user

新增 用户收藏api，取消收藏api

Author: Zhaofeng Li
Date: 2017.05.22
"""
# import json
# import urllib2
# import base64
# from urllib.request import urlopen, Request
# import urllib

import json
import requests

from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import request
from flask_jwt_extended import create_access_token
from mongoengine import DoesNotExist

from server3.repository import config
from server3.business import user_business
from server3.service import user_service
from server3.utility import json_utility

PREFIX = '/user'

user_app = Blueprint("user_app", __name__, url_prefix=PREFIX)


# appKey = '26eeaa3d279c322e84f95441'
# masterSecret = 'f024677b9cc3d1eff4148410'
# auth_string = appKey + ':' + masterSecret



@user_app.route('/get_verification_code/<phone>', methods=['get'])
def get_verification_code(phone):
    # print phone
    url = "https://api.sms.jpush.cn/v1/codes"
    payload = json.dumps({
        'mobile': phone,
        'temp_id': 1,
    })
    headers = {
        'content-type': "application/json",
        'authorization': "Basic MjZlZWFhM2QyNzljMzIyZTg0Zjk1NDQxOmYwMjQ2NzdiOWNjM2QxZWZmNDE0ODQxMA==",
    }
    response = requests.request("POST", url, data=payload, headers=headers)

    return make_response(jsonify({
        "response": response.json()
    }), 200)


@user_app.route('/verify_code', methods=['post'])
def get_verify_code():
    data = request.get_json()
    url = 'https://api.sms.jpush.cn/v1/codes/' + data['message_id'] + '/valid'
    payload = json.dumps({
        'code': data['code']
    })

    headers = {
        'content-type': "application/json",
        'authorization': "Basic MjZlZWFhM2QyNzljMzIyZTg0Zjk1NDQxOmYwMjQ2NzdiOWNjM2QxZWZmNDE0ODQxMA==",
    }
    response = requests.request("POST", url, data=payload, headers=headers)
    # result_json = response.json()
    is_valid = response.json()
    if is_valid:
        return make_response(jsonify({
            "response": response.json()
        }), 200)
    else:
        return make_response(jsonify({
            "response": response.json()
        }), 300)


@user_app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    user_ID = data['user_ID']
    password = data['password']
    data.pop('user_ID')
    data.pop('password')
    if user_ID is None or password is None:
        return jsonify({'response': 'invalid user or password'}), 400
    added_user = user_service.add(user_ID, password, data)
    added_user = json_utility.convert_to_json(added_user.to_mongo())
    added_user.pop('password')
    return jsonify({'response': added_user}), 200


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


@user_app.route('/favor_api', methods=['PUT'])
def favor_api():
    """
    在用户和api下都存一份
    用户存api_id
    api存 user_ID
    :return:
    :rtype:
    """
    user_ID = request.json.get('user_ID', None)
    api_id = request.json.get('api_id', None)
    result = user_service.favor_api(user_ID=user_ID, api_id=api_id)
    if result:
        result = json_utility.convert_to_json(result)
        return jsonify({
            'message': "success",
            'response': result
        }), 200
    else:
        return jsonify({'response': "failed"}), 400


@user_app.route('/star_api', methods=['PUT'])
def star_api():
    """
    在用户和api下都存一份
    用户存api_id
    api存 user_ID
    :return:
    :rtype:
    """
    user_ID = request.json.get('user_ID', None)
    api_id = request.json.get('api_id', None)
    result = user_service.star_api(user_ID=user_ID, api_id=api_id)
    if result:
        result = json_utility.convert_to_json(result)
        return jsonify({
            'message': "success",
            'response': result
        }), 200
    else:
        return jsonify({'response': "failed"}), 400




        # @user_app.route('/un_favor_api', methods=['PUT'])
        # def un_favor_api():
        #     """
        #     在用户和api下都存一份
        #     用户存api_id
        #     api存 user_ID
        #     :return:
        #     :rtype:
        #     """
        #     user_ID = request.json.get('user_ID', None)
        #     api_id = request.json.get('api_id', None)
        #     result = user_service.un_favor_api(user_ID=user_ID, api_id=api_id)
        #     if result:
        #         result = json_utility.convert_to_json(result)
        #         return jsonify({
        #             'message': "success",
        #             'response': result
        #         }), 200
        #     else:
        #         return jsonify({'response': "failed"}), 400

        # curl --insecure -X POST -v https://api.sms.jpush.cn/v1/codes -H "Content-Type: application/json"  -u "26eeaa3d279c322e84f95441:f024677b9cc3d1eff4148410" -d '{"mobile":"15988731660","temp_id":1}'
