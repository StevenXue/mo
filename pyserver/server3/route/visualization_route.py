# -*- coding: UTF-8 -*-
"""
Blueprint for analysis

Author: Tianyi Zhang
Date: 2017.05.24
"""
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
# from flask import make_response
from flask import request

from server3.service import visualization_service
from server3.business import staging_data_business
from server3.business import staging_data_set_business
from server3.utility import json_utility

PREFIX = '/visualization'
visualization_app = Blueprint("visualization_app", __name__, url_prefix=PREFIX)


@visualization_app.route('/visualization/usr1', methods=['POST'])
def usr1_visualization():
    data = request.get_json()
    field = data.get('field')
    staging_data_set_id = data.get('staging_data_set_id')
    type = data.get('type')

    try:
        data = staging_data_business.get_by_staging_data_set_and_fields(ObjectId(staging_data_set_id), field)
        data = [d.to_mongo().to_dict() for d in data]
        result = visualization_service.usr_story1_exploration(data, type)
        # print ('result', result)
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': json_utility.convert_to_json(result)}), 200


@visualization_app.route('/visualization/usr2', methods=['POST'])
def usr2_visualization():
    data = request.get_json()
    staging_data_set_id = data.get('staging_data_set_id')
    try:

        data = staging_data_set_business.get_by_id(ObjectId(staging_data_set_id))["visualization"]
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': json_utility.convert_to_json(data)}), 200

    # data = staging_data_set_business.get_by_id(ObjectId(staging_data_set_id)).to_mongo().to_dict()["visualization"]
    # result = visualization_service.usr_story2_exploration(data, "聚类")
    # return jsonify({'response': json_utility.convert_to_json(result)}), 200
