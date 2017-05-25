# -*- coding: UTF-8 -*-
"""
Blueprint for analysis

Author: Tianyi Zhang
Date: 2017.05.24
"""

from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request

from service import toolkit_service
from utility import json_utility

PREFIX = '/analysis'

analysis_app = Blueprint("analysis_app", __name__, url_prefix=PREFIX)


@analysis_app.route('/analysis_calculate', methods=['POST'])
def analysis_calculate():
    data = request.get_json()
    # 得到的func的名字是name么？
    name = data['name']
    input_data = data['input_data']

    try:
        result = toolkit_service.calculate(input_data, name)
    except Exception, e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}, 400))
    return make_response(jsonify({'message': 'calculate result success', 'response': result}), 200)


@analysis_app.route('/get_all_toolkit_info', methods=['GET'])
def get_all_toolkit_info():
    try:
        result = toolkit_service.get_all_public_toolkit()
    except Exception, e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}, 400))
    return make_response(jsonify({'message': 'get info success', 'response': json_utility.convert_to_json(result)}), 200)