# -*- coding: UTF-8 -*-
"""
Blueprint for project

Author: Zhaofeng Li
Date: 2017.05.25
"""
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request

from business import staging_data_business
from service import staging_data_service
from service import toolkit_service
from utility import json_utility

PREFIX = '/staging_data'

staging_data_app = Blueprint("staging_data_app", __name__, url_prefix=PREFIX)


@staging_data_app.route('/staging_data_sets/fields', methods=['GET'])
def get_fields_with_types():
    staging_data_set_id = request.args.get('staging_data_set_id')
    try:
        data = staging_data_service.get_fields_with_types(
            ObjectId(staging_data_set_id))
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': data}), 200


@staging_data_app.route('/staging_data_sets', methods=['GET'])
def list_staging_data_sets_by_project_id():
    project_id = request.args.get('project_id')
    try:
        data = staging_data_service.list_staging_data_sets_by_project_id(
            ObjectId(project_id))
        data = [d.to_mongo() for d in data]
        data = json_utility.convert_to_json(data)
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': data}), 200


# @staging_data_app.route('/staging_data_set_by_data_set_id', methods=[
@staging_data_app.route('/staging_data_sets', methods=[
    'POST'])
def add_staging_data_set_by_data_set_id():
    # sds_name, sds_description, project_id, data_set_id
    data = request.get_json()

    project_id = data['project_id']
    staging_data_set_name = data['staging_data_set_name']
    staging_data_set_description = data['staging_data_set_description']
    data_set_id = data['data_set_id']
    f_t_arrays = data['f_t_arrays']

    try:
        result = staging_data_service.add_staging_data_set_by_data_set_id(
            staging_data_set_name, staging_data_set_description,
            ObjectId(project_id), ObjectId(data_set_id), f_t_arrays)
        saved_sds = result['result']
        sds_json = json_utility.convert_to_json(saved_sds.to_mongo())
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    if 'failure_count' in result:
        failure_count = result['failure_count']
        return jsonify({'response': sds_json, 'failure_count':
                       failure_count}), 200
    return jsonify({'response': sds_json}), 200
