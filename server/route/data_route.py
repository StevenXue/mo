"""
Blueprint for project

Author: Zhaofeng Li
Date: 2017.05.24
"""
from bson import ObjectId

from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import request
from flask import send_from_directory

from service import data_service
from utility import json_utility

PREFIX = '/data'

data_app = Blueprint("data_app", __name__, url_prefix=PREFIX)


@data_app.route('/import_data_from_file_object_id', methods=['POST'])
def import_data_from_file_object_id():
    data = request.get_json()

    file_object_id = data['file_object_id']
    data_set_name = data['data_set_name']
    ds_description = data['ds_description']
    user_ID = data['user_ID']
    is_private = data['is_private']
    try:
        data_service.import_data_from_file_object_id(ObjectId(file_object_id),
                                                     data_set_name,
                                                     ds_description,
                                                     user_ID, bool(is_private))
    except Exception, e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}, 400))
    return make_response(jsonify({'response': 'import file to mongo success'}),
                         200)

