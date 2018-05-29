# -*- coding: UTF-8 -*-
"""
Blueprint for project

Author: Zhaofeng Li
Date: 2017.05.24
"""
from datetime import datetime
from datetime import tzinfo
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request
from kubernetes import client
from flask_jwt_extended import jwt_required, jwt_optional, get_jwt_identity

from server3.service import project_service
from server3.service.message_service import MessageService
from server3.service.project_service import ProjectService
from server3.service import ownership_service
from server3.service.app_service import AppService
from server3.service.module_service import ModuleService
from server3.service.dataset_service import DatasetService
from server3.business.project_business import ProjectBusiness
from server3.business.user_business import UserBusiness
from server3.utility import json_utility
from server3.utility import str_utility
from server3.constants import Error, Warning

PREFIX = '/project'
DEFAULT_CAT = ['model', 'toolkit']

project_app = Blueprint("project_app", __name__, url_prefix=PREFIX)


@project_app.route('/count', methods=['GET'])
def count_projects():
    user_ID = request.args.get('user_ID')
    types = ['app', 'module', 'dataset']
    # user_ID = get_jwt_identity()
    counts = []
    for type in types:
        projects = project_service.list_projects(
            type=type,
            user_ID=user_ID)
        counts.append(projects.count)
    return jsonify({
        "response": counts
    }), 200


@project_app.route('', methods=['GET'])
@jwt_optional
def list_projects_by_query():
    group = request.args.get('group')
    page_no = int(request.args.get('page_no', 1))
    page_size = int(request.args.get('page_size', 5))
    search_query = request.args.get('query', None)
    privacy = request.args.get('privacy', None)
    default_max_score = float(request.args.get('max_score', 0.4))
    type = request.args.get('type', 'project')
    tags = request.args.get('tags', None)
    if tags:
        tags = tags.split(',')

    if group == 'my':
        user_ID = get_jwt_identity()
    else:
        user_ID = None
        privacy = 'public'
    try:
        projects = project_service.list_projects(
            search_query=search_query,
            privacy=privacy,
            type=type,
            page_no=page_no,
            page_size=page_size,
            default_max_score=default_max_score,
            user_ID=user_ID,
            tags=tags
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
        for project in projects.objects:
            project.user_ID = project.user.user_ID
            # if project.user.avatar:
            #     project.user_avatar = project.user.avatar
        project_list = json_utility.me_obj_list_to_json_list(projects.objects)
        return jsonify({
            "response": {'projects': project_list, 'count': projects.count}
        }), 200


# new
@project_app.route('/projects/<string:project_id>', methods=['GET'])
@jwt_required
def get_project(project_id):
    if not project_id:
        return jsonify({'response': 'no project_id arg'}), 400
    project = ProjectBusiness.get_by_id(project_id)
    # if request.args.get('commits') == 'true':
    #     commits = ProjectBusiness.get_commits(project.path)
    #     project.commits = [{
    #         'message': c.message,
    #         'time': datetime.fromtimestamp(c.time[0] + c.time[1]),
    #     } for c in commits]
    project = json_utility.convert_to_json(project.to_mongo())
    project['commits'].reverse()
    return make_response(jsonify({'response': project}), 200)


# @project_app.route('/projects', methods=['GET'])
# def list_projects():
#     user_ID = request.args.get('user_ID')
#     privacy = request.args.get('privacy')
#     others = request.args.get('others')
#     if others == 'true':
#         projects = ownership_service.get_all_public_projects_of_others(user_ID)
#     else:
#         projects = project_service. \
#             list_projects_by_user_ID(user_ID, -1, privacy=privacy)
#     projects = json_utility. \
#         me_obj_list_to_json_list(projects)
#     return jsonify({'response': projects}), 200


# @project_app.route('/models/<string:user_ID>', methods=['GET'])
# def get_service_of_user(user_ID):
#
#     # 本来从job里取所有的 model，现改为从service中筛自己的
#
#     privacy = request.args.get('privacy')
#     status = 200
#     # categories = request.args.get('categories')
#     projects = project_service.list_projects_by_user_ID(user_ID, -1,
#                                                         privacy=privacy)
#     projects = json_utility.me_obj_list_to_json_list(projects)
#
#     all_models_of_user = {}
#     for each_project in projects:
#         all_models_in_this_project = project_service.get_all_jobs_of_project(
#             each_project['_id'],
#             categories=['model'],
#             status=status)
#         all_models_in_this_project = json_utility.convert_to_json(all_models_in_this_project)
#         all_models_of_user.update(all_models_in_this_project)
#
#     return jsonify({'response': all_models_of_user['model']}), 200


@project_app.route('/jobs/<string:project_id>', methods=['GET'])
def get_jobs_of_project(project_id):
    categories = request.args.get('categories')
    status = request.args.get('status')
    if categories is None:
        categories = DEFAULT_CAT
    else:
        categories = categories.split(',')
    if status is not None:
        status = int(status)

    for c in categories:
        if c not in DEFAULT_CAT:
            raise ValueError('categories arg error')
    history_jobs = project_service.get_all_jobs_of_project(project_id,
                                                           categories,
                                                           status)
    history_jobs = json_utility.convert_to_json(history_jobs)
    return jsonify({'response': history_jobs}), 200


@project_app.route('/fork/<string:project_id>', methods=['POST'])
def project_fork(project_id):
    user_ID = request.args.get('user_ID')
    if not user_ID:
        raise ValueError('no user ID arg')
    new_project = project_service.fork(project_id, user_ID)
    new_project = json_utility.convert_to_json(new_project.to_mongo())
    return jsonify({'response': new_project}), 200


@project_app.route('/publish/<string:project_id>', methods=['PUT'])
def project_publish(project_id):
    update_num = project_service.publish_project(project_id)
    update_num = json_utility.convert_to_json(update_num)
    return jsonify({'response': update_num}), 200


@project_app.route('/unpublish/<string:project_id>', methods=['PUT'])
def project_unpublish(project_id):
    update_num = project_service.unpublish_project(project_id)
    update_num = json_utility.convert_to_json(update_num)
    return jsonify({'response': update_num}), 200


# new
@project_app.route('/projects', methods=['POST'])
@jwt_required
def create_project():
    if not request.json \
            or 'name' not in request.json \
            or 'type' not in request.json:
        return jsonify({'response': 'insufficient arguments'}), 400

    user_token = request.headers.get('Authorization').split()[1]
    user_ID = get_jwt_identity()

    data = request.get_json()
    name = data.pop('name')
    type = data.pop('type')
    description = data.pop('description')
    tags = data.pop('tags', '')

    if not isinstance(tags, list) and tags is not None:
        data['tags'] = str_utility.split_without_empty(tags)

    type_mapper = {
        "app": AppService,
        "module": ModuleService,
        "dataset": DatasetService,
    }
    try:
        project = type_mapper[type].create_project(
            name, description, user_ID, tags=tags,
            type=type, user_token=user_token, **data)
    except Exception as e:
        return jsonify(
            {'response': str(e)}), 400
    project = json_utility.convert_to_json(project.to_mongo())
    return jsonify({'response': project}), 200


# @project_app.route('/projects/<string:project_id>', methods=['PUT'])
# def update_project(project_id):
#     data = request.get_json()
#     description = data.get('description')
#     privacy = data.get('privacy')
#     tags = data.get('tags', '')
#     tb_port = data.get('tb_port', None)
#
#     if not isinstance(tags, list):
#         tags = str_utility.split_without_empty(tags)
#
#     ProjectBusiness.update_project(project_id, description, privacy,
#                                    tags=tags, tb_port=tb_port)
#     return jsonify({'response': 'create project success'}), 200


@project_app.route('/projects/<string:project_identity>', methods=['PUT'])
def update_project(project_identity):
    data = request.get_json()

    tags = data.get('tags')
    if not isinstance(tags, list) and tags is not None:
        data['tags'] = str_utility.split_without_empty(tags)

    if request.args.get('by') == 'name':
        project = ProjectBusiness.update_project_by_identity(project_identity,
                                                             **data)
    else:
        project = ProjectBusiness.update_project(project_identity, **data)
    project = json_utility.convert_to_json(project.to_mongo())
    return jsonify({'response': project}), 200


@project_app.route('/projects/<string:project_id>', methods=['DELETE'])
@jwt_required
def remove_project(project_id):
    # user_ID = request.args.get('user_ID')
    user_ID = get_jwt_identity()
    if not project_id:
        return jsonify({'response': 'no project_id arg'}), 400
    if not user_ID:
        return jsonify({'response': 'no user_ID arg'}), 400
    result = ProjectBusiness.remove_project_by_id(project_id, user_ID)
    return jsonify({'response': result}), 200


# @project_app.route('/tensorboard/<string:project_id>', methods=['GET'])
# def get_tb(project_id):
#     return project_service.tb_proxy(project_id)
#     # return jsonify({'response': 1}), 200
#
#
# @project_app.route('/tensorboard/data', methods=['GET'])
# def get_tb(project_id):
#     # TODO
#     return project_service.tb_proxy(project_id)


@project_app.route('/playground/<string:project_id>', methods=['POST'])
def start_project_playground(project_id):
    if not project_id:
        return jsonify({'response': 'no project_id arg'}), 400
    try:
        port = project_service.start_project_playground(project_id)
    except client.rest.ApiException as e:
        return jsonify({'response': e.reason}), 400
    return jsonify({'response': port})


@project_app.route('/playground/<string:project_id>', methods=['GET'])
def get_project_playground(project_id):
    if not project_id:
        return jsonify({'response': 'no project_id arg'}), 400
    try:
        port = project_service.get_playground(project_id)
    except client.rest.ApiException as e:
        return jsonify({'response': e.reason}), 400
    return jsonify({'response': port})


@project_app.route("/commit/<project_id>", methods=["PUT"])
@jwt_required
def commit(project_id):
    data = request.get_json()
    commit_msg = data.get('commit_msg')
    ProjectService.commit(project_id, commit_msg)
    return jsonify({"response": 1})


@project_app.route("/commit_broadcast/<project_id>", methods=["POST"])
def commit_broadcast(project_id):
    project = ProjectBusiness.get_by_id(project_id)
    ProjectService.send_message(project, m_type='commit')
    return jsonify({"response": 1})


@project_app.route("/nb_to_script/<project_id>", methods=["POST"])
@jwt_required
def nb_to_script(project_id):
    data = request.get_json()
    optimise = data.get('optimise')
    nb_path = data.get('nb_path')
    try:
        # ProjectBusiness.nb_to_script(project_id, nb_path, optimise)
        ProjectBusiness.nb_to_py_script(project_id, nb_path, optimise)
    except FileNotFoundError as e:
        return jsonify({"response": 'Try save your notebook and convert '
                                    'again.'}), \
               399
    return jsonify({"response": 1})


@project_app.route("/get_hot_tag", methods=["GET"])
def get_hot_tag():
    search_query = request.args.get('search_query', None)
    project_type = request.args.get('project_type', None)
    return jsonify(ProjectService.get_hot_tag(search_query, project_type))
