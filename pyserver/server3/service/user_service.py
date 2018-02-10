# -*- coding: UTF-8 -*-
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash

from server3.business import user_business
from server3.business import api_business


def add(user_ID, password, kwargs):
    hashed_password = generate_password_hash(password)
    return user_business.add(user_ID, hashed_password, kwargs)


def authenticate(user_ID, password):
    user = user_business.get_by_user_ID(user_ID)
    if user and check_password_hash(user.password, password):
        user.id = str(user.id)
        return user
    return False


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
