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
    "algorithm": {
        "name": "k-mean",
        "_id": "5980149d8be34d34da32c170",
    }
}


@job_app.route("/job", methods=["POST"])
def create_job():
    """用于生成用户工作单位section


    :return:
    :rtype:
    """
    data = request.get_json()
    # todo 使用try except 捕捉错误
    if data["job_type"] == "toolkit":
        toolkit_id = ObjectId(data["algorithm"]["_id"])
        project_id = ObjectId(data["project_id"])

        job_obj = job_service.create_job(
            project_id=project_id,
            toolkit_id=toolkit_id
        )
        job_obj = json_utility.convert_to_json(job_obj.to_mongo())
        return jsonify({
            "response": {
                "job": job_obj
            }}), 200
    else:
        pass


@job_app.route("/job", methods=["PUT"])
def update_job():
    data = request.get_json()






@job_app.route("/job", methods=["DELETE"])
def delete_job():
    data = request.get_json()
    job_id = ObjectId(data['job_id'])
    result = job_business.remove_by_id(job_id)

    return jsonify({
        "response": {
            "result": result
        }}), 200


if __name__ == "__main__":
    create_job()
