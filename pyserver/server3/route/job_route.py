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
    print(data)
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


@job_app.route("/project/<string:project_type>/<string:project_id>",
               methods=["GET"])
def get_by_project(project_type, project_id):
    """

    :param project_type:
    :param project_id:
    :return:
    """

    def process(job):
        from datetime import datetime
        if job.status != 'running':
            job.duration = (job.updated_time - job.create_time).total_seconds()
        else:
            job.duration = (datetime.utcnow() - job.create_time).total_seconds()
        if not job.running_module:
            return json_utility.convert_to_json(job.to_mongo())
        rm = {'module': json_utility.convert_to_json(
            job.running_module.module.to_mongo()),
            'version': job.running_module.version,
            'user_ID': job.running_module.module.user.user_ID}
        del job.running_module
        job = json_utility.convert_to_json(job.to_mongo())
        job['running_module'] = rm
        return job

    jobs = JobService.get_by_project(project_type, project_id)
    jobs = [process(job) for job in jobs]
    jobs_by_path = {}
    for job in jobs:
        if job['source_file_path'] in jobs_by_path:
            jobs_by_path[job['source_file_path']].append(job)
        else:
            jobs_by_path[job['source_file_path']] = [job]
    return jsonify({
        "response": jobs_by_path
    }), 200


if __name__ == "__main__":
    create_job()
