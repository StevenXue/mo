# -*- coding: UTF-8 -*-
from bson import ObjectId
from datetime import datetime

from flask import Blueprint
from flask import jsonify
from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity

from server3.service.user_service import UserService
from server3.service.request_answer_service import RequestAnswerService
from server3.business.request_answer_business import RequestAnswerBusiness
from server3.business.user_business import UserBusiness
from server3.business.project_business import ProjectBusiness
from server3.business.comments_business import CommentsBusiness

from server3.utility import json_utility

PREFIX = '/request_answer'

request_answer_app = Blueprint("request_answer_app", __name__,
                               url_prefix=PREFIX)


@request_answer_app.route('', methods=['GET'])
def list_request_answer():
    user_request_id = request.args.get("user_request_id")
    user_ID = request.args.get("user_ID")
    page_no = int(request.args.get("page_no", 1))
    page_size = int(request.args.get("page_size", 10))
    type = request.args.get("type")
    search_query = request.args.get("search_query")
    if user_request_id:
        request_answer = RequestAnswerBusiness. \
            get_by_user_request_id(user_request_id)
        for each_one in request_answer:
            # todo 删除历史数据后，可删除此判断
            if each_one.answer_user:
                each_one.answer_user_ID = each_one.answer_user.user_ID
        request_answer_info = json_utility. \
            me_obj_list_to_json_list(request_answer)
        # 得到每一个answer下的comments 和 selcet project
        for index, answer in enumerate(request_answer_info):
            answer_comment = CommentsBusiness.get_comments(
                answer['_id'], comments_type='answer')
            answer_comment_info = json_utility. \
                me_obj_list_to_json_list(answer_comment)
            answer['comment'] = answer_comment_info
            if 'select_project' in answer:
                # 获取commit
                try:
                    commits = ProjectBusiness.get_commits(
                        request_answer[index].select_project.path)
                    select_project = request_answer[index].select_project
                    select_project.commits = [{
                        'message': c.message,
                        'time': datetime.fromtimestamp(c.time[0] + c.time[1]),
                    } for c in commits]
                    answer['select_project'] = json_utility.convert_to_json(
                        select_project.to_mongo())
                except:
                    answer['select_project'] = {'deleted': True}
        return jsonify({'response': request_answer_info}), 200
    elif user_ID:
        request_answer, total_number = RequestAnswerService. \
            get_all_answer_by_user_ID(user_ID, page_no, page_size,
                                      type, search_query)
        request_answer_info = json_utility. \
            me_obj_list_to_json_list(request_answer)
        return jsonify({'response': {'request_answer_info': request_answer_info,
                                     'total_number': total_number}}), 200
    else:
        return jsonify({'response': 'insufficient arguments'}), 400


@request_answer_app.route('', methods=['POST'])
@jwt_required
def create_request_answer():
    if not request.json \
            or 'answer' not in request.json \
            or 'user_request_id' not in request.json:
        return jsonify({'response': 'insufficient arguments'}), 400
    data = request.get_json()
    user_ID = get_jwt_identity()
    data['answer_user'] = UserBusiness.get_by_user_ID(user_ID=user_ID)
    select_project = data.pop('selectProject')
    if select_project:
        select_project = ObjectId(select_project)
        data['select_project'] = select_project
    user_request_id = data.pop('user_request_id')
    data['user_request'] = ObjectId(user_request_id)

    RequestAnswerService.create_request_answer(**data)
    return jsonify({'response': 'create request_answer success'}), 200


@request_answer_app.route('', methods=['PUT'])
@jwt_required
def update_request_answer():
    request_answer_id = request.args.get("request_answer_id")
    if not request.json \
            or 'answer' not in request.json:
        return jsonify({'response': 'insufficient arguments'}), 400
    data = request.get_json()
    answer = data['answer']
    RequestAnswerBusiness.update_request_answer_by_id(request_answer_id,
                                                      answer=answer)
    return jsonify({'response': 'update request_answer success'}), 200


@request_answer_app.route('', methods=['DELETE'])
@jwt_required
def remove_request_answer():
    user_ID = get_jwt_identity()
    request_answer_id = request.args.get('request_answer_id')
    result = RequestAnswerBusiness.remove_by_id(
        request_answer_id, user_ID)
    return jsonify({'response': result}), 200


@request_answer_app.route('/votes', methods=['PUT'])
@jwt_required
def update_request_answer_votes():
    data = request.get_json()
    user_ID = get_jwt_identity()
    request_answer_id = data["request_answer_id"]
    # votes_user_id = data["votes_user_id"]
    result = UserService.action_entity(user_ID=user_ID,
                                       entity_id=request_answer_id,
                                       action='vote_up', entity='answer')
    # result = user_service.update_answer_vote(request_answer_id, votes_user_id)
    result = json_utility.convert_to_json(result.entity.to_mongo())
    return jsonify({'response': result}), 200


@request_answer_app.route('/accept', methods=['PUT'])
@jwt_required
def accept_request_answer():
    data = request.get_json()
    user_request_id = data['user_request_id']
    user_ID = get_jwt_identity()
    request_answer_id = data["request_answer_id"]
    RequestAnswerService.accept_answer(user_request_id, user_ID,
                                       request_answer_id)
    return jsonify({'response': 'accept success'}), 200
