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

from server3.service import job_service

from server3.business import job_business

from server3.business import project_business
from server3.business import toolkit_business
from server3.business import ownership_business
from server3.utility import json_utility
from server3.service.logger_service import emit_error
from server3.service.logger_service import emit_success
from server3.service.logger_service import save_job_status

PREFIX = "/app"

app_app = Blueprint("app_app", __name__, url_prefix=PREFIX)


@app_app.route("/run", methods=["POST"])
def run_in_docker():
    data = request.get_json()
    print(data['code'])
    return jsonify({"response": {"code": 11}})


@app_app.route("/deploy/<app_id>", methods=["POST"])
@jwt_required
def deploy_in_docker():
    data = request.get_json()
    job_service.deploy_in_faas(app_id)
    return jsonify({"response": {"code": 11}})


if __name__ == "__main__":
    pass
