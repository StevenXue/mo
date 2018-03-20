"""
Blueprint for module

Author: Bingwei Chen
Date: 2018.01.28

module_route 即U4上传的 module 模块，本文件将实现所有关于 module 应用的服务
新增module，获取单个module，获取module列表，修改module
"""
import sys
from flask import Blueprint
from flask import jsonify
from flask import request

from server3.business import module_business, user_business
from server3.business.module_business import ModuleBusiness
from server3.utility import json_utility

PREFIX = '/module'

module_app = Blueprint("module_app", __name__, url_prefix=PREFIX)


@module_app.route('', methods=['POST'])
def add():
    data = request.get_json()
    try:
        name = data.pop("name")
        user_ID = data.pop("user_ID")
        user = user_business.get_by_user_ID(user_ID)
        result = module_business.add(name=name, user=user, **data)
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
    module_list = module_business.get_all().order_by('-create_time')
    module_list = json_utility.me_obj_list_to_json_list(module_list)
    return jsonify({
        "response": module_list
    }), 200


@module_app.route('/<module_id>', methods=['GET'])
def get_module(module_id):
    yml = request.args.get('yml')
    yml = str(yml).lower() == 'true'
    module = ModuleBusiness.get_by_id(module_id, yml=yml)
    module = json_utility.convert_to_json(module.to_mongo())
    return jsonify({
        "response": module
    }), 200


@module_app.route('/update_module', methods=['POST'])
def update_module():
    data = request.get_json()
    try:
        module_id = data.pop("module_id")
        result = module_business.update_by_id(module_id=module_id, **data)
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

        # module_id = module_business.get_by_module_id()


        # @module_app.route('update_doc', methods=['POST'])
        # def update_doc():
        #     data = request.get_json()


@module_app.route("/publish/<project_id>", methods=["POST"])
def deploy_in_docker(project_id):
    project = ModuleBusiness.publish(project_id)
    project = json_utility.convert_to_json(project.to_mongo())
    return jsonify({"response": project})
