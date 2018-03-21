# -*- coding: UTF-8 -*-
"""
Blueprint for dataset

Author: Zhaofeng Li
Date: 2018.03.21

"""
from flask import Blueprint
from flask import jsonify
from flask import request

from server3.service.dataset_service import DatasetService
from server3.utility import json_utility

PREFIX = "/datasets"

dataset_app = Blueprint("dataset_app", __name__, url_prefix=PREFIX)


@dataset_app.route('/<dataset_id>', methods=['GET'])
def get_app(dataset_id):
    commits = request.args.get('commits')
    dataset = DatasetService.get_by_id(dataset_id, commits=commits)

    # 将app.user 更换为 user_ID 还是name?
    user_ID = dataset.user.user_ID
    dataset = json_utility.convert_to_json(dataset.to_mongo())
    dataset["user_ID"] = user_ID
    return jsonify({"response": dataset}), 200

