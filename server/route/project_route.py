# -*- coding: UTF-8 -*-
"""
Blueprint for project

Author: Zhaofeng Li
Date: 2017.05.24
"""

from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request

from service import project_service

PREFIX = '/project'

project_app = Blueprint("project_app", __name__, url_prefix=PREFIX)


@project_app.route('/create_project', methods=['POST'])
def create_project():
    data = request.get_json()

    name = data['name']
    description = data['description']
    user_ID = data['user_ID']
    is_private = data['is_private']
    try:
        project_service.create_project(name, description, user_ID,
                                       bool(is_private))
    except Exception, e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': 'create project success'}), 200)

