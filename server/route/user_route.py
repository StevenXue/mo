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
from flask import send_from_directory

from repository import config
from business import user_business
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
        return make_response(jsonify({'response': 'invalid user or password'}),
                             400)
    try:
        added_user = user_business.add(user_ID, password, data)
        added_user = added_user.to_mongo()
        added_user = json_utility.convert_to_json(added_user)
        added_user.pop('password')
    except Exception, e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': added_user}), 200)

