# -*- coding: UTF-8 -*-
import json
import requests
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash

from server3.business import user_business
from server3.utility import json_utility
from server3.business import api_business
from server3.business import model_business
from server3.business import user_request_business
from server3.business import request_answer_business
from server3.business.app_business import AppBusiness
from server3.business.module_business import ModuleBusiness

from server3.constants import Error, ErrorMessage
from server3.entity.general_entity import UserEntity
from server3.business.user_request_business import UserRequestBusiness
from server3.business.data_set_business import DatasetBusiness

def add(user_ID, password, kwargs):
    hashed_password = generate_password_hash(password)
    return user_business.add(user_ID, hashed_password, kwargs)


def reset_password(phone, message_id, code, new_password):
    # 验证
    result = verify_code(code, message_id)
    if result:
        user = user_business.get_by_phone(phone=phone)
        user.password = generate_password_hash(new_password)
        return user.save()
        # else:
        #     raise Error(ErrorMessage)


def authenticate(user_ID, password):
    user = user_business.get_by_user_ID(user_ID)
    if user and check_password_hash(user.password, password):
        user.id = str(user.id)
        return user
    return False


def update_request_vote(user_request_id, user_ID):
    user = user_business.get_by_user_ID(user_ID)
    user_request = user_request_business. \
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


def update_request_star(user_request_id, user_ID):
    user = user_business.get_by_user_ID(user_ID)
    user_request = user_request_business. \
        get_by_user_request_id(user_request_id)

    if user_request in user.request_star:
        user.request_star.remove(user_request)
        user_result = user.save()
    else:
        user.request_star.append(user_request)
        user_result = user.save()

    if user in user_request.star_user:
        user_request.star_user.remove(user)
        user_request_result = user_request.save()
    else:
        user_request.star_user.append(user)
        user_request_result = user_request.save()
    if user_result and user_request_result:
        return user_request_result


def update_answer_vote(request_answer_id, user_ID):
    user = user_business.get_by_user_ID(user_ID)
    request_answer = request_answer_business. \
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


def add_used_api(user_ID, api_id):
    """
    为用户增加 使用过的api
    :param user_ID:
    :type user_ID:
    :param api_id:
    :type api_id:
    :return:
    :rtype:
    """
    user = user_business.get_by_user_ID(user_ID=user_ID)
    api = api_business.get_by_api_id(api_id=api_id)
    user_result = None
    if api not in user.used_apis:
        user.used_apis.append(api)
        user_result = user.save()
    if user_result:
        return {
            "user": user_result.to_mongo(),
        }


def get_verification_code(phone):
    """

    :param phone:
    :type phone:
    :return: {message_id: aalalals}
    :rtype:
    """
    url = "https://api.sms.jpush.cn/v1/codes"
    payload = json.dumps({
        'mobile': phone,
        'temp_id': 1,
    })
    headers = {
        'content-type': "application/json",
        'authorization': "Basic MjZlZWFhM2QyNzljMzIyZTg0Zjk1NDQxOmYwMjQ2NzdiOWNjM2QxZWZmNDE0ODQxMA==",
    }
    response = requests.request("POST", url, data=payload, headers=headers)
    result = response.json()
    if "error" in result:
        raise Error(result["error"])
    return response.json()["message_id"]


def verify_code(code, message_id):
    url = 'https://api.sms.jpush.cn/v1/codes/' + message_id + '/valid'
    payload = json.dumps({
        'code': code
    })
    headers = {
        'content-type': "application/json",
        'authorization': "Basic MjZlZWFhM2QyNzljMzIyZTg0Zjk1NDQxOmYwMjQ2NzdiOWNjM2QxZWZmNDE0ODQxMA==",
    }
    response = requests.request("POST", url, data=payload, headers=headers)
    result = response.json()
    if "error" in result:
        raise Error(result["error"])
    return response.json()["is_valid"]
    # if is_valid:
    #     return response.json()
    # else:
    #     return make_response(jsonify({
    #         "response": response.json()
    #     }), 300)


class UserService:
    @classmethod
    def action_entity(cls, user_ID, entity_id, action, entity):
        user = user_business.get_by_user_ID(user_ID=user_ID)
        business_maper = {
            "app": AppBusiness,
            "module": ModuleBusiness,
            "request": UserRequestBusiness,
            "dataset": DatasetBusiness,
        }
        business = business_maper[entity]
        object = business.get_by_id(entity_id)

        if entity == "request":
            user_keyword = '{action}_{entity}'.format(action=action, entity=entity)
            object_keyword = '{action}_user'.format(action=action)
        else:
            user_keyword = '{action}_{entity}s'.format(action=action, entity=entity)
            object_keyword = '{action}_users'.format(action=action)

        # 1. 在user下存favor_apps
        if object not in user[user_keyword]:
            user[user_keyword].append(object)
            user_result = user.save()
        else:
            user[user_keyword].remove(object)
            user_result = user.save()
        # 2. 在object下存favor_users
        if user not in object[object_keyword]:
            object[object_keyword].append(user)
            object_result = object.save()
        else:
            object[object_keyword].remove(user)
            object_result = object.save()
        if user_result and object_result:
            return UserEntity(user=user_result, entity=object_result)
    
    @classmethod
    def favor_app(cls, user_ID, app_id):
        return FavorApp.action(user_ID, app_id)
        # user = user_business.get_by_user_ID(user_ID=user_ID)
        # app = AppBusiness.get_by_id(project_id=app_id)
        # # 1. 在user下存favor_apps
        # if app not in user.favor_apps:
        #     user.favor_apps.append(app)
        #     user_result = user.save()
        # else:
        #     user.favor_apps.remove(app)
        #     user_result = user.save()
        # # 2. 在app下存favor_users
        # if user not in app.favor_users:
        #     app.favor_users.append(user)
        #     app_result = app.save()
        # else:
        #     app.favor_users.remove(user)
        #     app_result = app.save()
        #
        # if user_result and app_result:
        #     return FavorAppReturn(user=user_result, app=app_result)

    @classmethod
    def star_app(cls, user_ID, app_id):
        return StarApp.action(user_ID, app_id)

    @classmethod
    def star_request(cls, user_ID, app_id):
        return StarApp.action(user_ID, app_id)


# 尝试合并代码
class Action:
    business = None  # app / module
    action_type = None  # favor / star /
    # favor_apps
    user_keyword = None
    # user_keyword = '{business}_{action_type}s'.format(business=business, action_type=action_type)
    # favor_users
    # object_keyword = '{action_type}_users'.format(action_type=action_type)
    object_keyword = None

    @classmethod
    def action(cls, user_ID, object_id):
        user = user_business.get_by_user_ID(user_ID=user_ID)
        app = cls.business.get_by_id(project_id=object_id)

        if app not in user[cls.user_keyword]:
            user[cls.user_keyword].append(app)
            user_result = user.save()
        else:
            user[cls.user_keyword].remove(app)
            user_result = user.save()
        # 2. 在app下存favor_users
        if user not in app[cls.object_keyword]:
            app[cls.object_keyword].append(user)
            app_result = app.save()
        else:
            app[cls.object_keyword].remove(user)
            app_result = app.save()
        if user_result and app_result:
            return UserEntity(user=user_result, entity=app_result)


class FavorApp(Action):
    business = AppBusiness
    action_type = 'favor'
    user_keyword = 'favor_apps'
    object_keyword = 'favor_users'


class StarApp(Action):
    business = AppBusiness
    action_type = 'star'
    user_keyword = 'star_apps'
    object_keyword = 'favor_users'


class StarRequest(Action):
    business = UserRequestBusiness
    action_type = 'star'
    user_keyword = 'star_apps'
    object_keyword = 'favor_users'


class FavorModule(Action):
    # business = ModuleBusiness
    pass
