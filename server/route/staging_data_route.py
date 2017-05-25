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
from utility import json_utility

PREFIX = '/staging_data'

staging_data_app = Blueprint("staging_data_app", __name__, url_prefix=PREFIX)


@staging_data_app.route('/get_by_staging_data_set_and_fields', methods=['GET'])
def get_by_staging_data_set_and_fields():
    staging_data_set_id = request.args.get('staging_data_set_id')
    fields = request.args.get('fields')
    fields = fields.split(',')
    try:
        data = staging_data_business.get_by_staging_data_set_and_fields(
            ObjectId(staging_data_set_id), fields)
        data = [d.to_mongo() for d in data]
        data = json_utility.convert_to_json(data)
    except Exception, e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}, 400))
    return make_response(jsonify({'response': data}),
                         200)

