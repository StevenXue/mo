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
    # saved_ds = data_service.import_data_from_file_id(ObjectId(file_id),
    #                                                  data_set_name,
    #                                                  ds_description,
    #                                                  user_ID,
    #                                                  bool(is_private))
    # ds_json = json_utility.convert_to_json(saved_ds.to_mongo())
    try:
        saved_ds = data_service.import_data_from_file_id(ObjectId(file_id),
                                                         data_set_name,
                                                         ds_description,
                                                         user_ID,
                                                         bool(is_private))
        ds_json = json_utility.convert_to_json(saved_ds.to_mongo())
    except Exception, e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return make_response(jsonify({'response': ds_json}),
                         200)

