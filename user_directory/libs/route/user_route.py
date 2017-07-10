# -*- coding: UTF-8 -*-
"""
Blueprint for file

Author: Zhaofeng Li
Date: 2017.05.22
"""

from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import request
from flask_jwt_extended import create_access_token
from mongoengine import DoesNotExist

from repository import config
from business import user_business
from service import user_service
from utility import json_utility

PREFIX = '/user'

user_app = Blueprint("user_app", __name__, url_prefix=PREFIX)


@user_app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    user_ID = data['user_ID']
    password = data['password']
    data.pop('user_ID')
    data.pop('password')
    if user_ID is None or password is None:
        return jsonify({'response': 'invalid user or password'}), 400
    # added_user = user_service.add(user_ID, password, data)
    # added_user = json_utility.convert_to_json(added_user.to_mongo())
    # added_user.pop('password')
    try:
        added_user = user_service.add(user_ID, password, data)
        added_user = json_utility.convert_to_json(added_user.to_mongo())
        added_user.pop('password')
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
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
