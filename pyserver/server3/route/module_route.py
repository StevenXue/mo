import sys
from flask import Blueprint
from flask import jsonify
from flask import request

from server3.business import module_business, user_business
from server3.utility import json_utility

PREFIX = '/module'

module_app = Blueprint("module_app", __name__, url_prefix=PREFIX)


@module_app.route('', methods=['POST'])
def add():
    data = request.get_json()
    try:
        user_ID = data.pop("user_ID")
        name = data.pop("name")
        user = user_business.get_by_user_ID(user_ID)
        result = module_business.add(user=user, name=name, **data)
        print("result", result)
        result = json_utility.convert_to_json(result.to_mongo())
        return jsonify({
            "response": result
        }), 200
    except KeyError:
        return jsonify({
            "response": {"message": "no enough params"}
        }), 300
    except:
        print("Unexpected error:", sys.exc_info()[0])
        raise


@module_app.route('/module_list', methods=['GET'])
def get_module_list():
    module_list = module_business.get_all()
    module_list = json_utility.me_obj_list_to_json_list(module_list)
    return jsonify({
        "response": module_list
    }), 200


@module_app.route('/<module_id>', methods=['GET'])
def get_module(module_id):
    module = module_business.get_by_module_id(module_id)
    module = json_utility.me_obj_list_to_json_list(module)
    return jsonify({
        "response": module
    }), 200

# @module_app.route('update_doc', methods=['POST'])
# def update_doc():
#     data = request.get_json()

