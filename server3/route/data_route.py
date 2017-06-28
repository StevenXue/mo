# -*- coding: UTF-8 -*-
"""
Blueprint for project

Author: Zhaofeng Li
Date: 2017.05.24
"""
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import request

from service import data_service
from utility import json_utility
from business import data_business
import constants

PREFIX = '/data'

data_app = Blueprint("data_app", __name__, url_prefix=PREFIX)


@data_app.route('/data_sets', methods=['GET'])
def list_data_sets_by_user_ID():
    user_ID = request.args.get('user_ID')
    if not user_ID:
        jsonify({'response': 'insufficient args'}), 400
    if user_ID:
        try:
            public_ds, owned_ds = data_service.\
                list_data_sets_by_user_ID(user_ID, -1)
            public_ds = json_utility.me_obj_list_to_json_list(public_ds)
            owned_ds = json_utility.me_obj_list_to_json_list(owned_ds)
            result = {
                'public_ds': public_ds,
                'owned_ds': owned_ds
            }
        except Exception as e:
            return jsonify({'response': '%s: %s' % (str(Exception),
                                                    e.args)}), 400
        return jsonify({'response': result}), 200
    return jsonify({'response': 'insufficient arguments'}), 400


@data_app.route('/data_sets/fields/<string:data_set_id>', methods=['GET'])
def get_fields_with_types(data_set_id):
    try:
        data = data_service.get_fields_with_types(ObjectId(data_set_id))
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': data}), 200


@data_app.route('/data_sets/fields/<string:data_set_id>', methods=['PUT'])
def filter_fields(data_set_id):
    data = request.get_json()
    if not data:
        return jsonify({'response': 'insufficient args'}), 400
    fields = data['fields']
    if not fields:
        return jsonify({'response': 'insufficient args'}), 400
    try:
        updated_n = data_business.filter_data_set_fields(ObjectId(data_set_id),
                                                         fields)
        if updated_n > 0:
            res = 'success'
        else:
            res = 'no data updated'
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': res}), 200


@data_app.route('/data_sets/<string:data_set_id>', methods=['GET'])
def get_data_set(data_set_id):
    limit = request.args.get('limit')
    if not limit:
        limit = 100
    try:
        data = data_business.get_by_data_set_limit(ObjectId(data_set_id),
                                                   int(limit))
        fields = data_service.get_fields_with_types(ObjectId(data_set_id))
        fields = {e[0]: e[1] for e in fields}
        data = json_utility.me_obj_list_to_json_list(data)
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': data, 'fields': fields}), 200


@data_app.route('/data_sets/integrity/<string:data_set_id>', methods=['GET'])
def check_data_set_integrity(data_set_id):
    try:
        result = data_service.check_data_set_integrity(ObjectId(data_set_id))
        result['fill_blank'] = constants.FILL_BLANK
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': result}), 200


@data_app.route('/data_sets/integrity', methods=['PUT'])
def update_data_set_integrity():
    update = request.get_json()
    try:
        result = data_service.update_data(update)
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': result}), 200


@data_app.route('/data_sets', methods=['POST'])
def import_data_from_file_id():
    data = request.get_json()
    user_ID = data['user_ID']
    file_id = data['file_id']
    data_set_name = data['data_set_name']
    ds_description = data['ds_description']
    is_private = data['is_private']
    is_private = str(is_private).lower() == 'true'

    try:
        saved_ds = data_service.import_data_from_file_id(ObjectId(file_id),
                                                         data_set_name,
                                                         ds_description,
                                                         user_ID,
                                                         is_private)
        ds_json = json_utility.convert_to_json(saved_ds.to_mongo())
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': ds_json}), 200


@data_app.route('/data_sets/<string:data_set_id>', methods=['DELETE'])
def remove_data_set_by_id(data_set_id):
    try:
        result = data_service.remove_data_set_by_id(ObjectId(data_set_id))
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': result}), 200

