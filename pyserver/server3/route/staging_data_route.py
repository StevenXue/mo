# -*- coding: UTF-8 -*-
"""
Blueprint for project

Author: Zhaofeng Li
Date: 2017.05.25
"""
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import request

from server3.business import staging_data_business
from server3.business import staging_data_set_business
from server3.service import staging_data_service
from server3.service import toolkit_service
from server3.utility import json_utility
from server3 import constants

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
    without_result = request.args.get('without_result')
    without_result = str(without_result).lower() == 'true'
    try:
        data = staging_data_service.list_staging_data_sets_by_project_id(
            ObjectId(project_id), without_result)
        data = [d.to_mongo() for d in data]
        data = json_utility.convert_to_json(data)
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': data}), 200


@staging_data_app.route('/staging_data_sets/<string:sds_id>', methods=['GET'])
def get_staging_data_set(sds_id):
    limit = request.args.get('limit')
    if limit is None:
        limit = 10
    data_set = staging_data_set_business.get_by_id(sds_id)
    response = staging_data_business. \
        get_by_staging_data_set_id_limit(ObjectId(sds_id), int(limit))
    response = json_utility.me_obj_list_to_json_list(response)
    response = {'data': response}
    columns = staging_data_service.get_fields_with_types(
        ObjectId(sds_id))

    response['field'] = getattr(data_set, 'related_field', None)
    response['tags'] = getattr(data_set, 'tags', None)
    response['related tasks'] = getattr(data_set, 'related_tasks', None)
    # response['data_set_type'] = data_set.file.type
    print("data_set", data_set)
    if hasattr(data_set, 'file'):
        if data_set.file:
            print("data_set.file", data_set.file.__dict__)
            response['data_set_type'] = data_set.file.type
    # response['data_set_type'] = data_set.file.type
    response['columns'] = columns

    # update row col info
    response.update(staging_data_service.get_row_col_info(ObjectId(sds_id)))
    return jsonify({'response': response}), 200


@staging_data_app.route('/staging_data_sets', methods=['POST'])
def add_staging_data_set_by_data_set_id():
    data = request.get_json()

    project_id = data['project_id']
    staging_data_set_name = data['staging_data_set_name']
    staging_data_set_description = data['staging_data_set_description']
    data_set_id = data['data_set_id']
    saved_sds = staging_data_service.add_staging_data_set_by_data_set_id(
        staging_data_set_name, staging_data_set_description,
        ObjectId(project_id), ObjectId(data_set_id))
    sds_json = json_utility.convert_to_json(saved_sds.to_mongo())
    return jsonify({'response': sds_json}), 200


@staging_data_app.route('/staging_data_sets/types', methods=['PUT'])
def convert_fields_type():
    data = request.get_json()

    sds_id = data['staging_data_set_id']
    f_t_arrays = data['f_t_arrays']

    try:
        result = staging_data_service.convert_fields_type(ObjectId(sds_id),
                                                          f_t_arrays)
        saved_sds = result['result']
        sds_json = json_utility.convert_to_json(saved_sds.to_mongo())
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    if 'failure_count' in result:
        failure_count = result['failure_count']
        return jsonify({'response': sds_json, 'failure_count':
                       failure_count}), 200
    return jsonify({'response': sds_json}), 200


@staging_data_app.route('/staging_data_sets/integrity/<string:data_set_id>',
                        methods=['GET'])
def check_staging_data_set_integrity(data_set_id):
    try:
        result = staging_data_service.check_integrity(ObjectId(data_set_id))
        result['fill_blank'] = constants.FILL_BLANK
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': result}), 200


@staging_data_app.route('/staging_data_sets/integrity', methods=['PUT'])
def update_data_set_integrity():
    update = request.get_json()
    try:
        result = staging_data_service.update_data(update)
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': result}), 200


@staging_data_app.route('/staging_data_sets/fields/<string:sds_id>', methods=[
    'PUT'])
def filter_fields(sds_id):
    data = request.get_json()
    if data is None:
        return jsonify({'response': 'no json'}), 400
    fields = data['fields']
    if fields is None or fields == []:
        return jsonify({'response': 'no fields'}), 400
    try:
        updated_n = staging_data_business.\
            filter_data_set_fields(ObjectId(sds_id), fields)
        if updated_n > 0:
            res = 'success'
        else:
            res = 'no data updated'
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': res}), 200


@staging_data_app.route('/staging_data/rows', methods=['DELETE'])
def delete_rows():
    data = request.get_json()
    if data is None:
        return jsonify({'response': 'no json'}), 400
    rows = data['rows']
    if rows is None:
        return jsonify({'response': 'no rows'}), 400
    try:
        rows = [ObjectId(row_id) for row_id in rows]
        staging_data_business.remove_data_by_ids(rows)
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': 'success'}), 200


@staging_data_app.route('/staging_data_sets/<string:sds_id>',
                        methods=['DELETE'])
def remove_staging_data_set_by_ids(sds_id):
    try:
        result = staging_data_service.remove_staging_data_set_by_id(ObjectId(
            sds_id))
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': result}), 200


@staging_data_app.route('/staging_data_sets/update_type',
                        methods=['PUT'])
def update_staging_data_set():
    try:
        data = request.get_json()
        job_id = data['job_id']
        # staging_data_set = staging_data_service.get_by_job_id(job_id=job_id)
        result = staging_data_service.update_staging_data_set_by_job_id(job_id=job_id)
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    result = json_utility.convert_to_json(result.to_mongo())
    return jsonify({'response': result}), 200


