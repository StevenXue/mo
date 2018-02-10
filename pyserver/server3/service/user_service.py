# -*- coding: UTF-8 -*-
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash

from server3.business import user_business
from server3.utility import json_utility


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
    user = json_utility.convert_to_json(user.to_mongo())

    request_vote_up = user['request_vote_up']
    if user_request_id in request_vote_up:
        request_vote_up.remove(user_request_id)
    else:
        request_vote_up.append(user_request_id)
    return user_business.\
        update_user_request_by_id(user_ID, request_vote_up=request_vote_up)


def add_favor_api(user_ID, api):
    user = user_business.get_by_user_ID(user_ID=user_ID)
    favor_apis = user.favor_apis
    favor_apis.append(api)
    user.favor_apis = favor_apis
    return user.save()





