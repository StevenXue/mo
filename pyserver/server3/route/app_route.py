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

from server3.service import app_service
from server3.business.app_business import AppBusiness

from server3.utility import json_utility

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
    func = data.get('func')
    app = app_service.add_used_module(app_id, used_modules, func)
    return jsonify({"response": json_utility.convert_to_json(app.to_mongo())})


@app_app.route("/nb_to_script/<app_id>", methods=["POST"])
@jwt_required
def nb_to_script(app_id):
    data = request.get_json()
    nb_path = data.get('nb_path')
    AppBusiness.nb_to_script(app_id, nb_path)
    return jsonify({"response": 1})


@app_app.route('/<app_id>', methods=['GET'])
def get_module(app_id):
    yml = request.args.get('yml')
    yml = str(yml).lower() == 'true'
    app = AppBusiness.get_by_id(app_id, yml=yml)
    app = json_utility.convert_to_json(app.to_mongo())
    return jsonify({
        "response": app
    }), 200


if __name__ == "__main__":
    pass
