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
from utility import json_utility

PREFIX = '/project'

project_app = Blueprint("project_app", __name__, url_prefix=PREFIX)


@project_app.route('/create_project', methods=['POST'])
def create_project():
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
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': 'create project success'}), 200)


@project_app.route('/list_projects_by_user_ID', methods=['GET'])
def list_projects_by_user_ID():
    user_ID = request.args.get('user_ID')
    try:
        public_projects, owned_projects = project_service.list_projects_by_user_ID(
            user_ID)
        public_projects = json_utility.me_obj_list_to_dict_list(public_projects)
        owned_projects = json_utility.me_obj_list_to_dict_list(owned_projects)
        result = {
            'public_projects': public_projects,
            'owned_projects': owned_projects
        }
    except Exception as e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': result}), 200)


@project_app.route('/remove_project_by_id', methods=['DELETE'])
def remove_project_by_id():
    project_id = request.args.get('project_id')
    try:
        result = project_service.remove_project_by_id(ObjectId(project_id))
    except Exception as e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': result}), 200)