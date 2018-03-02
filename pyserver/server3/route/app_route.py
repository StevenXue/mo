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

from server3.service import job_service, project_service
from server3.service.app_service import AppService

from server3.service.logger_service import emit_error
from server3.service.logger_service import emit_success
from server3.service.logger_service import save_job_status
from server3.business.app_business import AppBusiness
from server3.business import job_business
from server3.business import project_business
from server3.business import toolkit_business
from server3.business import ownership_business
from server3.utility import json_utility
from server3.utility import str_utility

PREFIX = "/app"

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
    app = AppBusiness.add_used_module(app_id, used_modules)
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


if __name__ == "__main__":
    pass
