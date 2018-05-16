# -*- coding: UTF-8 -*-
"""
Blueprint for app

Author: Bingwei Chen
Date: 2017.10.20

"""
import sys, traceback
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request
from flask_jwt_extended import jwt_required
from bson import ObjectId
from mongoengine import DoesNotExist

from flask_jwt_extended import jwt_required, get_jwt_identity

from server3.service.app_service import AppService
from server3.business.app_business import AppBusiness
from server3.utility import json_utility
from server3.utility import str_utility
from server3.constants import Error, Warning

PREFIX = "/apps"

app_app = Blueprint("app_app", __name__, url_prefix=PREFIX)


@app_app.route("/run", methods=["POST"])
def run_in_docker():
    data = request.get_json()
    return jsonify({"response": {"code": 11}})


@app_app.route("/deploy/<app_id>", methods=["POST"])
@jwt_required
def deploy_in_docker(app_id):
    data = request.get_json()
    handler_file_path = data.get('file_path')
    commit_msg = data.get('commit_msg')
    project = AppService.deploy(app_id, commit_msg, handler_file_path)
    project = json_utility.convert_to_json(project.to_mongo())
    return jsonify({"response": project})


@app_app.route("/publish/<app_id>/<version>", methods=["POST"])
@jwt_required
def publish_in_docker(app_id, version):
    data = request.get_json()
    handler_file_path = data.get('file_path')
    commit_msg = data.get('commit_msg')
    project = AppService.publish(app_id, commit_msg, handler_file_path,
                                 version)
    project = json_utility.convert_to_json(project.to_mongo())
    return jsonify({"response": project})


@app_app.route("/add_used_module/<app_id>", methods=["PUT"])
@jwt_required
def add_used_module(app_id):
    data = request.get_json()
    used_module = data.get('used_module')
    func = data.get('func')
    version = data.get('version')
    app = AppService.add_used_module(app_id, used_module, func, version)
    return jsonify({"response": convert_used_modules(app)})


@app_app.route("/remove_used_module/<app_id>", methods=["PUT"])
@jwt_required
def remove_used_module(app_id):
    data = request.get_json()
    used_module = data.get('used_module')
    version = data.get('version')
    app = AppService.remove_used_module(app_id, used_module, version)
    return jsonify({"response": convert_used_modules(app)})


@app_app.route("/add_used_dataset/<app_id>", methods=["PUT"])
@jwt_required
def add_used_dataset(app_id):
    data = request.get_json()
    used_dataset = data.get('used_dataset')
    app = AppService.add_used_dataset(app_id, used_dataset)
    return jsonify({"response": convert_used_datasets(app)})


@app_app.route("/remove_used_dataset/<app_id>", methods=["PUT"])
@jwt_required
def remove_used_dataset(app_id):
    data = request.get_json()
    used_dataset = data.get('used_dataset')
    app = AppService.remove_used_dataset(app_id, used_dataset)
    return jsonify({"response": convert_used_datasets(app)})


@app_app.route("/insert_envs/<project_name>", methods=["PUT"])
# @jwt_required
def insert_envs(project_name):
    """
    insert env api when jl container start
    :param project_name:
    :return:
    """
    [user_ID, app_name] = project_name.split('+')
    try:
        AppService.insert_envs(user_ID, app_name)
    except DoesNotExist:
        return jsonify({"response": f'no app {project_name} or not an app'})
    else:
        return jsonify({"response": f'insert_envs success {project_name}'})


@app_app.route("/nb_to_script/<app_id>", methods=["POST"])
@jwt_required
def nb_to_script(app_id):
    data = request.get_json()
    optimise = data.get('optimise')
    nb_path = data.get('nb_path')
    AppBusiness.nb_to_script(app_id, nb_path, optimise)
    return jsonify({"response": 1})


@app_app.route("/", methods=["POST"])
@jwt_required
def add():
    """
    :return:
    :rtype:
    """
    if not request.json \
            or 'name' not in request.json \
            or 'type' not in request.json:
        return jsonify({'response': 'insufficient arguments'}), 400

    user_token = request.headers.get('Authorization').split()[1]
    user_ID = get_jwt_identity()

    data = request.get_json()
    name = data.pop('name')
    type = "app"  # data.pop('type')
    description = data.pop('description')
    tags = data.pop('tags', '')

    tags = str_utility.split_without_empty(tags)

    project = AppService.create_project(
        name, description, user_ID,
        tags=tags,
        type=type, user_token=user_token,
        **data)
    project = json_utility.convert_to_json(project.to_mongo())
    return jsonify({'response': project}), 200


@app_app.route('/<app_id>', methods=['GET'])
def get_app(app_id):
    yml = request.args.get('yml')
    commits = request.args.get('commits')
    version = request.args.get('version')
    used_modules = request.args.get('used_modules')
    used_datasets = request.args.get('used_datasets')
    app = AppService.get_by_id(app_id, yml=yml, commits=commits,
                               version=version, used_modules=used_modules)

    # 将app.user 更换为 user_ID 还是name?
    user_ID = app.user.user_ID
    if used_modules == 'true':
        app = convert_used_modules(app)
    if used_datasets == 'true':
        app = convert_used_datasets(app)
    if used_modules != 'true' and used_datasets != 'true':
        app = json_utility.convert_to_json(app.to_mongo())
    app["user_ID"] = user_ID
    app["commits"].reverse()
    return jsonify({
        "response": app
    }), 200


def convert_action_entity(objects, action_entity):
    if action_entity == 'used_modules':
        ums = [{'module': json_utility.convert_to_json(m.module.to_mongo()),
                'version': '.'.join(m.version.split('_'))} for m in
               objects]
        return ums
    if action_entity == 'used_datasets':
        uds = [{'dataset': json_utility.convert_to_json(m.dataset.to_mongo())}
               for m in objects]
        return uds


@app_app.route('/get_action_entity/<app_id>', methods=['GET'])
def get_app_action_entity(app_id):
    action_entity = request.args.get("action_entity")
    page_no = int(request.args.get('page_no', 1))
    page_size = int(request.args.get('page_size', 5))
    at_objs = AppService.get_action_entity(
        app_id=app_id,
        action_entity=action_entity,
        page_no=page_no,
        page_size=page_size,
    )

    objects = convert_action_entity(at_objs.objects, action_entity)

    return jsonify({
        'response': {
            "objects": objects,
            "page_size": at_objs.page_size,
            "page_no": at_objs.page_no,
            "count": at_objs.count,
        }
    })


def convert_used_modules(app):
    ums = [{'module': json_utility.convert_to_json(m.module.to_mongo()),
            'version': '.'.join(m.version.split('_'))} for m in
           app.used_modules]
    del app.used_modules
    app = json_utility.convert_to_json(app.to_mongo())
    app['used_modules'] = ums
    return app


def convert_used_datasets(app):
    ums = [{'dataset': json_utility.convert_to_json(d.dataset.to_mongo())}
           for d in app.used_datasets]
    del app.used_datasets
    app = json_utility.convert_to_json(app.to_mongo())
    app['used_datasets'] = ums
    return app


@app_app.route('', methods=['GET'])
@jwt_required
def get_api_list():
    """
    带搜索关键字的,
    :return:
    :rtype:
    """
    user_ID = get_jwt_identity()
    page_no = int(request.args.get('page_no', 1))
    page_size = int(request.args.get('page_size', 5))
    search_query = request.args.get('search_query', None)
    default_max_score = float(request.args.get('max_score', 0.1))
    try:
        api_list = AppService.list_projects(
            search_query=search_query, page_no=page_no, page_size=page_size,
            default_max_score=default_max_score, privacy=None,
            user_ID=None
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
        objects = api_list.objects
        for object in objects:
            object.user_ID = object.user.user_ID
        objects = json_utility.me_obj_list_to_json_list(objects)
        return jsonify({
            "response": {
                "objects": objects,
                "count": api_list.count,
                "page_no": api_list.page_no,
                "page_size": api_list.page_size

            },
        }), 200


# 这个获取 chat
@app_app.route('/chat', methods=['GET'])
@jwt_required
def get_chat_api_list():
    """
    带搜索关键字的,
    :return:
    :rtype:
    """
    # user_ID = get_jwt_identity()
    page_no = int(request.args.get('page_no', 1))
    page_size = int(request.args.get('page_size', 5))
    search_query = request.args.get('search_query', None)
    default_max_score = float(request.args.get('max_score', 0.1))
    privacy = request.args.get('privacy')

    if not search_query:
        return jsonify({'response': 'no search_query arg'}), 400
    try:
        api_list = AppBusiness.list_projects_chat(
            search_query, page_no=page_no, page_size=page_size,
            default_max_score=default_max_score, privacy=privacy
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

        objects = json_utility.me_obj_list_to_json_list(api_list.objects)
        return jsonify({
            "response": {
                "objects": objects,
                "count": api_list.count,
                "page_no": api_list.page_no,
                "page_size": api_list.page_size,
            }
        }), 200


@app_app.route("/run/<app_id>", methods=["POST"])
@jwt_required
def run_app(app_id):
    user_ID = get_jwt_identity()
    data = request.get_json()
    input_json = data["app"]["input"]
    version = data["version"]
    result = AppService.run_app(app_id, input_json=input_json,
                                user_ID=user_ID, version=version)
    return jsonify({"response": result})

# if __name__ == "__main__":
#     pass
