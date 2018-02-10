# -*- coding: UTF-8 -*-
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash

from server3.business import user_business
from server3.utility import json_utility
from server3.business import api_business
from server3.business import user_request_business
from server3.business import request_answer_business

def add(user_ID, password, kwargs):
    hashed_password = generate_password_hash(password)
    return user_business.add(user_ID, hashed_password, kwargs)


def authenticate(user_ID, password):
    user = user_business.get_by_user_ID(user_ID)
    if user and check_password_hash(user.password, password):
        user.id = str(user.id)
        return user
    return False


def update_request_vote(user_request_id, user_ID):
    user = user_business.get_by_user_ID(user_ID)
    user_request = user_request_business.\
        get_by_user_request_id(user_request_id)

    if user_request in user.request_vote_up:
        user.request_vote_up.remove(user_request)
        user_result = user.save()
    else:
        user.request_vote_up.append(user_request)
        user_result = user.save()

    if user in user_request.votes_up_user:
        user_request.votes_up_user.remove(user)
        user_request_result = user_request.save()
    else:
        user_request.votes_up_user.append(user)
        user_request_result = user_request.save()
    if user_result and user_request_result:
        return user_request_result.to_mongo()


def update_answer_vote(request_answer_id, user_ID):
    user = user_business.get_by_user_ID(user_ID)
    request_answer = request_answer_business.\
        get_by_request_answer_id(request_answer_id)

    if request_answer in user.answer_vote_up:
        user.answer_vote_up.remove(request_answer)
        user_result = user.save()
    else:
        user.answer_vote_up.append(request_answer)
        user_result = user.save()

    if user in request_answer.votes_up_user:
        request_answer.votes_up_user.remove(user)
        request_answer_result = request_answer.save()
    else:
        request_answer.votes_up_user.append(user)
        request_answer_result = request_answer.save()

    if user_result and request_answer_result:
        return request_answer_result.to_mongo()


def favor_api(user_ID, api_id):
    """
    :param user_ID:
    :type user_ID:
    :param api_id:
    :type api_id:
    :return:
    :rtype:
    """
    user = user_business.get_by_user_ID(user_ID=user_ID)
    api = api_business.get_by_api_id(api_id=api_id)
    # user_result, api_result = None, None
    # 1. 在user下存favor_apis
    if api not in user.favor_apis:
        user.favor_apis.append(api)
        user_result = user.save()
    else:
        user.favor_apis.remove(api)
        user_result = user.save()
    # 2. 在api下存favor_users
    if user not in api.favor_users:
        api.favor_users.append(user)
        api_result = api.save()
    else:
        api.favor_users.remove(user)
        api_result = api.save()

    if user_result and api_result:
        return {
            "user": user_result.to_mongo(),
            "api": api_result.to_mongo()
        }


def star_api(user_ID, api_id):
    """
    :param user_ID:
    :type user_ID:
    :param api_id:
    :type api_id:
    :return:
    :rtype:
    """
    user = user_business.get_by_user_ID(user_ID=user_ID)
    api = api_business.get_by_api_id(api_id=api_id)
    # user_result, api_result = None, None
    # 1. 在user下存star_apis
    if api not in user.star_apis:
        user.star_apis.append(api)
        user_result = user.save()
    else:
        user.star_apis.remove(api)
        user_result = user.save()
    # 2. 在api下存star_users
    if user not in api.star_users:
        api.star_users.append(user)
        api_result = api.save()
    else:
        api.star_users.remove(user)
        api_result = api.save()

    if user_result and api_result:
        return {
            "user": user_result.to_mongo(),
            "api": api_result.to_mongo()
        }


# def un_favor_api(user_ID, api_id):
#     user = user_business.get_by_user_ID(user_ID=user_ID)
#     api = api_business.get_by_api_id(api_id=api_id)
#     # 1. 在user下删除favor_apis
#     user.favor_apis.remove(api)
#     user_result = user.save()
#     # 2. 在api下删除favor_users
#     api.favor_users.remove(user)
#     api_result = api.save()
#
#     if user_result and api_result:
#         return {
#             "user": user_result.to_mongo(),
#             "api": api_result.to_mongo()
#         }




