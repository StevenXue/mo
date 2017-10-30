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
    print("data", data)
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
        # job_obj = json_utility.convert_to_json(job_obj.to_mongo())
        # print("job_obj.steps[2]", job_obj.steps[2])
        new_args = {}
        if len(job_obj.steps) > 2:
            args = job_obj.steps[2].get("args")

        for arg in args:
            new_args[arg['name']] = int(arg['value'])

        obj = {
            "staging_data_set_id": job_obj.steps[0]["args"][0]["value"],
            "conf": {
                "args": new_args,
                "data_fields":
                # ["HighAlpha", "Attention_dimension_reduction_PCA_col"]
                    job_obj.steps[1]["args"][0]["values"]
            },
            "project_id": project_id,
            "toolkit_id": job_obj.toolkit.id,
        }
    else:
        if not job_obj.model:
            return jsonify(
                {"response": 'no model and toolkit in job object'}), 400

        model_obj = job_obj.model
        steps = job_obj.steps
        conf = {}
        if model_obj.category == 0:
            for step in steps[4: -1]:
                conf.update({step.get('name'):
                                 {arg.get('name'): arg.get('value')
                                                   or arg.get('values')
                                                   or arg.get('default')
                                  for arg in step['args']}
                             })

            print(conf)
            conf['fit'].update({
                "data_fields":
                    [steps[1]["args"][0]["values"],
                     steps[2]["args"][0]["values"]]
            })
            conf['layers'] = [{
                'name': layer.get('name'),
                'args': {arg.get('name'): arg.get('value')
                                          or arg.get('values')
                                          or arg.get('default')
                         for arg in layer.get('args')}
            }
                for layer in steps[3]['args'][0]['values']]
            print(conf)
        elif model_obj.category == 1:
            pass
        elif model_obj.category == 2:
            pass

        obj = {
            "staging_data_set_id": job_obj.steps[0]["args"][0]["value"],
            "conf": conf,
            "project_id": project_id,
            "model_id": model_obj.id,
            "schema": "rand",
            "ratio": "0.7"
        }
        print(obj)
    # result = job_service.run_job(obj=obj, job_obj=job_obj)

    # obj = {
    #     "staging_data_set_id": "59c21d71d845c0538f0faeb2",
    #     "conf": {
    #         "args": {"k": "3"},
    #         "data_fields": ["Attention", "Attention_dimension_reduction_PCA_col"]},
    #     "project_id": "59c21ca6d845c0538f0fadd5",
    #     "toolkit_id": "5980149d8be34d34da32c170",
    # }

    return jsonify({
        "response": {
            "result": 1
        }}), 200


if __name__ == "__main__":
    create_job()
