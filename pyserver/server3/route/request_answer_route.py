# -*- coding: UTF-8 -*-
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request

from server3.service import comments_service
from server3.service import request_answer_service
from server3.utility import json_utility
from server3.service import user_service

PREFIX = '/request_answer'

request_answer_app = Blueprint("request_answer_app", __name__,
                                      url_prefix=PREFIX)


@request_answer_app.route('', methods=['GET'])
def list_request_answer():
    user_request_id = request.args.get("user_request_id")
    user_id = request.args.get("user_ID")
    if user_request_id:
        request_answer = request_answer_service. \
            get_all_answer_of_this_user_request(user_request_id)
        request_answer = json_utility. \
            me_obj_list_to_json_list(request_answer)
        # 得到每一个answer下的comments

        for answer in request_answer:
            answer_comment = comments_service.get_comments_of_this_answer(
                answer['_id'])
            answer_comment = json_utility. \
                me_obj_list_to_json_list(answer_comment)
            answer['comment'] = answer_comment

        return jsonify({'response': request_answer}), 200
    elif user_id:
        request_answer = request_answer_service.\
            list_request_answer_by_user_id(user_id)
        request_answer = json_utility. \
            me_obj_list_to_json_list(request_answer)
        return jsonify({'response': request_answer}), 200
    else:
        return jsonify({'response': 'insufficient arguments'}), 400


@request_answer_app.route('', methods=['POST'])
def create_request_answer():
    print('aha')
    if not request.json \
            or 'answer' not in request.json \
            or 'user_request_id' not in request.json \
            or 'user_id' not in request.json:
        return jsonify({'response': 'insufficient arguments'}), 400
    data = request.get_json()
    answer = data['answer']
    user_id = data['user_id']
    user_request_id = data['user_request_id']
    print('user_request_id')
    print(user_request_id)

    request_answer_service.create_request_answer(
        user_request_id, user_id, answer)
    return jsonify({'response': 'create request_answer success'}), 200


@request_answer_app.route('', methods=['PUT'])
def update_request_answer():
    request_answer_id = request.args.get("request_answer_id")
    if not request.json \
            or 'answer' not in request.json \
            or 'request_answer_id' not in request.json \
            or 'user_id' not in request.json :
        return jsonify({'response': 'insufficient arguments'}), 400
    data = request.get_json()
    answer = data['answer']
    user_id = data['user_id']
    request_answer_service.update_request_answer(
        request_answer_id, user_id, answer)
    return jsonify({'response': 'update request_answer success'}), 200


@request_answer_app.route('', methods=['DELETE'])
def remove_request_answer():
    user_id = request.args.get('user_ID')
    request_answer_id = request.args.get('request_answer_id')
    if not request_answer_id:
        return jsonify({'response': 'no request_answer_id arg'}), 400
    if not user_id:
        return jsonify({'response': 'no user_ID arg'}), 400
    result = request_answer_service.remove_request_answer_by_id(
        ObjectId(request_answer_id), user_id)
    return jsonify({'response': result}), 200


@request_answer_app.route('/votes', methods=['PUT'])
def update_request_answer_votes():
    data = request.get_json()
    request_answer_id = data["request_answer_id"]
    votes_user_id = data["votes_user_id"]
    result = user_service.update_answer_vote(request_answer_id, votes_user_id)
    result = json_utility.convert_to_json(result)
    print('update_request_answer_votes')
    return jsonify({'response': result}), 200