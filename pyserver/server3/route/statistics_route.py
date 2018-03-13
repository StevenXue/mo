# 是否需要 route 层， 可以在获取user,或者app时调用 statistics 的business
#
# import sys, traceback
# from flask import Blueprint
# from flask import jsonify
# from flask import make_response
# from flask import request
# from flask_jwt_extended import jwt_required
# from bson import ObjectId
#
# from flask_jwt_extended import jwt_required, get_jwt_identity
#
# from server3.service.app_service import AppService
# from server3.business.app_business import AppBusiness
# from server3.utility import json_utility
# from server3.utility import str_utility
# from server3.constants import Error, Warning
#
# PREFIX = "/apps"
#
# app_app = Blueprint("app_app", __name__, url_prefix=PREFIX)
#
#
# @app_app.route("/run", methods=["POST"])
# def run_in_docker():
#     data = request.get_json()
#     print(data['code'])
#     return jsonify({"response": {"code": 11}})