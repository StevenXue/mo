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

from server3.service import toolkit_service
from server3.business import toolkit_business
from server3.business import staging_data_business
from server3.utility import json_utility

PREFIX = '/toolkit'

toolkit_app = Blueprint("toolkit_app", __name__, url_prefix=PREFIX)

ALLOWED_EXTENSIONS = {'py'}
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
        # 新增方法按照category分类
        # result = toolkit_service.get_all_public_toolkit()
        result = toolkit_service.get_all_public_toolkit_by_category()
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
    staging_data_set_id = data.get('staging_data_set_id')
    toolkit_id = data.get('toolkit_id')
    project_id = data.get('project_id')
    conf = data.get('conf')

    # conf初步操作
    flag = isinstance(conf["data_fields"][0], (list, tuple))
    x_fields = conf["data_fields"][0] if flag else conf["data_fields"]
    y_fields = conf["data_fields"][1] if flag else None
    fields = x_fields + y_fields if flag else x_fields
    data = staging_data_business.get_by_staging_data_set_and_fields(
        ObjectId(staging_data_set_id), fields)

    # 数据库转to_mongo和to_dict
    data = [d.to_mongo().to_dict() for d in data]

    # 拿到conf
    fields = [x_fields, y_fields]
    conf = conf.get('args')

    result = toolkit_service.convert_json_and_calculate(project_id,
                                                        staging_data_set_id,
                                                        toolkit_id,
                                                        fields, data, conf)
    result.update({"fields": [x_fields, y_fields]})
    return jsonify({'response': json_utility.convert_to_json(result)}), 200

    # 上线前需要改成try形式
    # try:
    # except Exception as e:
    #     return jsonify({'response': '%s: %s' % (str(Exception), e.args)}), 400
    # return jsonify({'response': json_utility.convert_to_json(result)}), 200
