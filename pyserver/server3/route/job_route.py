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
from bson import ObjectId
from flask_jwt_extended import jwt_required
from flask_jwt_extended import get_jwt_identity

from server3.service.job_service import JobService

from server3.business.job_business import JobBusiness

from server3.utility import json_utility

PREFIX = "/jobs"

job_app = Blueprint("job_app", __name__, url_prefix=PREFIX)


@job_app.route("", methods=["POST"])
def create_job():
    """用于生成用户工作单位section


    :return:
    :rtype:
    """
    data = request.get_json()
    project_id = data.get("project_id")
    type = data.get("type")
    user_ID = data.get("user_ID")

    source_file_path = data.get("source_file_path")
    run_args = data.get("run_args")
    running_module = data.get("running_module")
    running_code = data.get("running_code")
    job_obj = JobService.create_job(
        project_id=project_id,
        type=type,
        user_ID=user_ID,
        source_file_path=source_file_path,
        run_args=run_args,
        running_module=running_module,
        running_code=running_code,
    )
    job_obj = json_utility.convert_to_json(job_obj.to_mongo())
    return jsonify({
        "response": job_obj
    })


@job_app.route("/<string:job_id>/log", methods=["PUT"])
def update_job_log(job_id):
    data = request.get_json()
    log_type = data.get('log_type')
    message = data.get('message')
    result = JobBusiness.update_log(job_id, log_type, message)
    result = json_utility.convert_to_json(result.to_mongo())
    return jsonify({
        "response": result
        }), 200


@job_app.route("/<string:job_id>/terminate", methods=["PUT"])
def terminate_job(job_id):
    result = JobBusiness.update_job_status(job_id, 'terminate')
    result = json_utility.convert_to_json(result.to_mongo())
    return jsonify({
        "response": result
    }), 200


@job_app.route("/<string:job_id>/success", methods=["PUT"])
def success_job(job_id):
    result = JobBusiness.update_job_status(job_id, 'success')
    result = json_utility.convert_to_json(result.to_mongo())
    return jsonify({
        "response": result
    }), 200


if __name__ == "__main__":
    create_job()
