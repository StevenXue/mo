# -*- coding: UTF-8 -*-
"""
Blueprint for analysis

Author: Tianyi Zhang
Date: 2017.05.24
"""
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request

from service import toolkit_service
from business import toolkit_business
from business import staging_data_business
from utility import json_utility

PREFIX = '/toolkit'

toolkit_app = Blueprint("toolkit_app", __name__, url_prefix=PREFIX)

ALLOWED_EXTENSIONS = set(['py'])
# UPLOAD_URL = '/uploads/'
REQUEST_FILE_NAME = 'uploaded_code'


def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# 后端直接传输了，不一定要restful api
# @toolkit_app.route('/analysis_calculate', methods=['POST'])
# def analysis_calculate():
#     data = request.get_json()
#     # 得到的func的名字是name么？
#     id = data['id']
#     input_data = data['input_data']
#
#     try:
#         result = toolkit_service.calculate(input_data, id)
#     except Exception, e:
#         return make_response(jsonify({'response': '%s: %s' % (str(
#             Exception), e.args)}), 400)
#     return make_response(jsonify({'message': 'calculate result success', 'response': result}), 200)


@toolkit_app.route('/toolkits/public', methods=['GET'])
def get_all_toolkit_info():
    try:
        result = toolkit_service.get_all_public_toolkit()
    except Exception as e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}), 400)
    return jsonify({'message': 'get info success', 'response':
        json_utility.convert_to_json(result)}), 200


@toolkit_app.route('/toolkits', methods=['POST'])
def upload_code():
    user_ID = request.form['user_ID']
    is_private = request.form['if_private']
    name = request.form['name']
    description = request.form['description']
    entry_function = request.form['entry_function']
    parameter_spec = request.form['parameter_spec']
    # convert string to bool
    is_private = str(is_private).lower() == 'true'

    if request.method == 'POST':
        # check if the post request has the file part
        if REQUEST_FILE_NAME not in request.files:
            return make_response(jsonify({'response': 'no file part'}), 400)
        file = request.files[REQUEST_FILE_NAME]
        if file.filename == '':
            return make_response(jsonify({'response': 'no selected file'}), 400)
        if file and allowed_file(file.filename):
            try:
                target_py_code = file.read()
                toolkit_service.add_toolkit_with_ownership(name, description,
                                                           target_py_code,
                                                           entry_function,
                                                           eval(parameter_spec),
                                                           user_ID,
                                                           is_private)
            except Exception as e:
                return jsonify({'response': '%s: %s' % (str(
                    Exception), e.args)}), 400
            return jsonify({'response': 'success'}), 200
        else:
            return jsonify({'response': 'file is not allowed'}), 400


@toolkit_app.route('/toolkits/staging_data_set', methods=['POST'])
def get_by_staging_data_set_and_fields():
    data = request.get_json()
    fields = data.get('fields')
    staging_data_set_id = data.get('staging_data_set_id')
    toolkit_id = data.get('toolkit_id')
    project_id = data.get('project_id')
    # 初始值为0
    k = data.get('k')
    if k is not None:
        k = int(k)

    try:
        data = staging_data_business.get_by_staging_data_set_and_fields(
            ObjectId(staging_data_set_id), fields)
        data = [d.to_mongo().to_dict() for d in data]
        result = toolkit_service.convert_json_and_calculate(project_id,
                                                            staging_data_set_id,
                                                            toolkit_id, fields,
                                                            data, k)
    except Exception as e:
        return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    return jsonify({'response': json_utility.convert_to_json(result)}), 200
