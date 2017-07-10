# -*- coding: UTF-8 -*-
"""
Blueprint for project

Author: Zhaofeng Li
Date: 2017.05.24
"""
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request

from service import project_service
from business import project_business
from utility import json_utility

PREFIX = '/project'

project_app = Blueprint("project_app", __name__, url_prefix=PREFIX)


@project_app.route('/projects/<string:project_id>', methods=['GET'])
def get_project(project_id):
    if not project_id:
        return jsonify({'response': 'no project_id arg'}), 400
    try:
        project = project_business.get_by_id(project_id)
    except Exception as e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': project}), 200)


@project_app.route('/projects', methods=['GET'])
def list_projects():
    user_ID = request.args.get('user_ID')
    if user_ID:
        try:
            public_projects, owned_projects = project_service.\
                list_projects_by_user_ID(user_ID, -1)
            public_projects = json_utility.\
                me_obj_list_to_json_list(public_projects)
            owned_projects = json_utility.\
                me_obj_list_to_json_list(owned_projects)
            result = {
                'public_projects': public_projects,
                'owned_projects': owned_projects
            }
        except Exception as e:
            return (jsonify({'response': '%s: %s' % (str(Exception),
                                                     e.args)}), 400)
        return jsonify({'response': result}), 200
    return jsonify({'response': 'insufficient arguments'}), 400


@project_app.route('/projects', methods=['POST'])
def create_project():
    if not request.json \
            or 'name' not in request.json \
            or 'user_ID' not in request.json \
            or 'is_private' not in request.json:
        return jsonify({'response': 'insufficient arguments'}), 400

    data = request.get_json()
    name = data['name']
    description = data['description']
    user_ID = data['user_ID']
    is_private = data['is_private']
    is_private = str(is_private).lower() == 'true'

    try:
        project_service.create_project(name, description, user_ID,
                                       is_private)
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': 'create project success'}), 200


@project_app.route('/projects/<string:project_id>', methods=['DELETE'])
def remove_project(project_id):
    if not project_id:
        return jsonify({'response': 'no project_id arg'}), 400
    try:
        result = project_service.remove_project_by_id(ObjectId(project_id))
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': result}), 200
