# -*- coding: UTF-8 -*-
"""
Blueprint for job

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
    print(data['code'])
    return jsonify({"response": {"code": 11}})


@app_app.route("/deploy/<app_id>", methods=["POST"])
@jwt_required
def deploy_in_docker(app_id):
    service_name = AppBusiness.deploy(app_id)
    return jsonify({"response": service_name})


@app_app.route("/add_used_module/<app_id>", methods=["PUT"])
@jwt_required
def add_used_module(app_id):
    data = request.get_json()
    used_modules = data.get('used_modules', [])
    func = data.get('func')
    app = AppService.add_used_module(app_id, used_modules, func)
    return jsonify({"response": json_utility.convert_to_json(app.to_mongo())})


@app_app.route("/nb_to_script/<app_id>", methods=["POST"])
@jwt_required
def nb_to_script(app_id):
    data = request.get_json()
    nb_path = data.get('nb_path')
    AppBusiness.nb_to_script(app_id, nb_path)
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
def get_module(app_id):
    yml = request.args.get('yml')
    yml = str(yml).lower() == 'true'
    app = AppBusiness.get_by_id(app_id, yml=yml)

    # 将app.user 更换为 user_ID 还是name?
    user_ID = app.user.user_ID
    app = json_utility.convert_to_json(app.to_mongo())
    app["user"] = user_ID
    return jsonify({
        "response": app
    }), 200


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
        # objects = api_list["objects"]
        for object in objects:
            object.user_user_ID = object.user.user_ID
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

    if not search_query:
        return jsonify({'response': 'no search_query arg'}), 400
    try:
        api_list = AppBusiness.list_projects_chat(
            search_query, page_no=page_no, page_size=page_size,
            default_max_score=default_max_score
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
    data = request.get_json()
    input_json = data["app"]["input"]
    result = AppService.run_app(app_id, input_json=input_json)
    return jsonify({"response": result})

# if __name__ == "__main__":
#     pass
