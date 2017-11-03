# -*- coding: UTF-8 -*-
"""
Blueprint for job

Author: Bingwei Chen
Date: 2017.10.20

"""

from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request
from bson import ObjectId

from server3.service import job_service

from server3.business import job_business

from server3.business import project_business
from server3.business import toolkit_business
from server3.utility import json_utility

PREFIX = "/job"

job_app = Blueprint("job_app", __name__, url_prefix=PREFIX)

eg = {
    "project_id": "59c21ca6d845c0538f0fadd5",
    "job_type": "toolkit",
    "algorithm_id": "5980149d8be34d34da32c170",

}


@job_app.route("/job", methods=["POST"])
def create_job():
    """用于生成用户工作单位section


    :return:
    :rtype:
    """
    data = request.get_json()
    # todo 使用try except 捕捉错误
    job_type = data["job_type"]
    # algorithm_id = data.get("algorithm_id")
    model_id = data.get("model_id")
    toolkit_id = data.get("toolkit_id")
    project_id = data["project_id"]
    job_obj = job_service.create_job(project_id=project_id,
                                     toolkit_id=toolkit_id,
                                     model_id=model_id)
    algorithm = job_obj[job_type].to_mongo()
    # 将job的toolkit转换成object
    job_obj = job_obj.to_mongo()
    job_obj[job_type] = algorithm
    job_obj = json_utility.convert_to_json(job_obj)
    return jsonify({
        "response": {
            "job": job_obj
        }}), 200
    # if data["job_type"] == "toolkit":
    #
    # else:
    #     pass


@job_app.route("/job_steps", methods=["PUT"])
def update_job_steps():
    data = request.get_json()
    # print("data", data)
    job_id, steps, active_steps = ObjectId(data["_id"]), data['steps'], data[
        'active_steps']
    result = job_business.update_job_steps(job_id, steps, active_steps)
    result = json_utility.convert_to_json(result.to_mongo())
    return jsonify({
        "response": {
            "result": result
        }}), 200


@job_app.route("/job", methods=["DELETE"])
def delete_job():
    data = request.get_json()
    job_id = ObjectId(data['job_id'])
    result = job_business.remove_by_id(job_id)

    return jsonify({
        "response": {
            "result": result
        }}), 200


@job_app.route("/run_job", methods=["POST"])
def run_job():
    data = request.get_json()
    job_id = data['section_id']
    project_id = data["project_id"]

    job_obj = job_business.get_by_job_id(job_id)
    if job_obj.toolkit:
        result = job_service.run_toolkit_job(project_id=project_id, job_obj=job_obj)
    else:
        if not job_obj.model:
            return jsonify(
                {"response": 'no model and toolkit in job object'}), 400
        result = job_service.run_model_job(project_id=project_id, job_obj=job_obj)
    result = json_utility.convert_to_json(result)
    return jsonify({
        "response": {
            "result": result
        }}), 200


@job_app.route("/save_result", methods=["POST"])
def save_result():
    '''

    :return:
    :rtype:
    '''
    data = {
        "job_id": "59fbddb7d845c05927560783"
    }
    data = request.get_json()
    job_id = data['job_id']

    job_service.save_result(
        job_id=job_id,
    )


@job_app.route("/save_as_result", methods=["POST"])
def save_as_result():
    data = {
        'job_id': '59fbddb7d845c05927560783',
        'new_sds_name': 'xxx',
    }
    data = request.get_json()
    job_id = data['job_id']
    new_sds_name = data.get("new_sds_name")

    job_service.save_as_result(
        job_id=job_id,
        new_sds_name=new_sds_name
    )



if __name__ == "__main__":
    create_job()
