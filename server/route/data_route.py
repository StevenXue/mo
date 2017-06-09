# -*- coding: UTF-8 -*-
"""
Blueprint for project

Author: Zhaofeng Li
Date: 2017.05.24
"""
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request

from service import data_service
from utility import json_utility
from business import data_business

PREFIX = '/data'

data_app = Blueprint("data_app", __name__, url_prefix=PREFIX)


@data_app.route('/import_data_from_file_id', methods=['POST'])
def import_data_from_file_id():
    data = request.get_json()
    user_ID = data['user_ID']
    file_id = data['file_id']
    data_set_name = data['data_set_name']
    ds_description = data['ds_description']
    is_private = data['is_private']
    is_private = is_private.lower() == 'true'

    try:
        saved_ds = data_service.import_data_from_file_id(ObjectId(file_id),
                                                         data_set_name,
                                                         ds_description,
                                                         user_ID,
                                                         is_private)
        ds_json = json_utility.convert_to_json(saved_ds.to_mongo())
    except Exception, e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': ds_json}),
                         200)


@data_app.route('/list_data_sets_by_user_ID', methods=['GET'])
def list_data_sets_by_user_ID():
    user_ID = request.args.get('user_ID')
    try:
        public_ds, owned_ds = data_service.list_data_sets_by_user_ID(user_ID)
        public_ds = json_utility.me_obj_list_to_dict_list(public_ds)
        owned_ds = json_utility.me_obj_list_to_dict_list(owned_ds)
        result = {
            'public_ds': public_ds,
            'owned_ds': owned_ds
        }
    except Exception, e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': result}), 200)


@data_app.route('/get_fields_with_types', methods=['GET'])
def get_fields_with_types():
    data_set_id = request.args.get('data_set_id')
    try:
        data = data_service.get_fields_with_types(
            ObjectId(data_set_id))
    except Exception, e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': data}),
                         200)


@data_app.route('/get_data_set', methods=['GET'])
def get_data_set():
    data_set_id = request.args.get('data_set_id')
    limit = request.args.get('limit')
    try:
        data = data_business.get_by_data_set_limit(
            ObjectId(data_set_id), int(limit))
        data = json_utility.me_obj_list_to_dict_list(data)
    except Exception, e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': data}),
                         200)