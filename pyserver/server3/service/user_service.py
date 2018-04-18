# -*- coding: UTF-8 -*-
import json
import requests
from werkzeug.security import generate_password_hash
from werkzeug.security import check_password_hash
from mongoengine import DoesNotExist

from server3.business import user_business
from server3.utility import json_utility
from server3.business import api_business
from server3.business import model_business
from server3.business import user_request_business
from server3.business import request_answer_business
from server3.business.app_business import AppBusiness
from server3.business.project_business import ProjectBusiness
from server3.business.module_business import ModuleBusiness
from server3.business.user_business import UserBusiness

from server3.constants import Error, ErrorMessage, GIT_SERVER
from server3.entity.general_entity import UserEntity
from server3.business.user_request_business import UserRequestBusiness
from server3.business.request_answer_business import RequestAnswerBusiness
from server3.business.data_set_business import DatasetBusiness

from server3.entity.phone_message_id import PhoneMessageId
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.image import MIMEImage
from email.header import Header
smtpserver = 'smtp.163.com'
username = '15669929857@163.com'
password='wurao122'
sender='15669929857@163.com'
# receiver='374758875@qq.com'
subject = 'Python email test'
msg = MIMEMultipart('mixed')
msg['Subject'] = subject
msg['From'] = '15669929857@163.com <15669929857@163.com>'
# msg['To'] = '374758875@qq.com'
# text = "Hi!\nHow are you?\nHere is the link you wanted:\nhttp://localhost:8989/#/user/login"    
# text_plain = MIMEText(text,'plain', 'utf-8')    
# msg.attach(text_plain)   
def add_git_http_user(user_ID, password):
    """
    auth jupyterhub with user token
    :param user_ID:
    :param password:
    :param user_token:
    :return: dict of res json
    """
    return requests.post(f'{GIT_SERVER}/git/{user_ID}',
                         json={'password': password})


def add(user_ID, password, **kwargs):
    add_git_http_user(user_ID, password)
    hashed_password = generate_password_hash(password)
    return user_business.add(user_ID, hashed_password, **kwargs)


def register(user_ID, password, phone, code, **kwargs):
    # 验证失败会抛出错误
    verify_code(code=code, phone=phone)
    return add(user_ID=user_ID, password=password, phone=phone, **kwargs)


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

def forgot_send(email):
    user = user_business.get_by_email(email)
    if user:
        receiver= email
        msg['To'] = email
        # ssstr = 'Hi!\nHow are you?\nHere is the link you wanted:\nhttp://localhost:8989/#/user/login?email='+email
        text = 'Hi!\nHow are you?\nHere is the link you wanted:\nhttp://localhost:8989/#/user/login?email='+email
        text_plain = MIMEText(text,'plain', 'utf-8')
        msg.attach(text_plain)
        smtp = smtplib.SMTP()
        smtp.connect('smtp.163.com')
        smtp.login(username, password)
        smtp.sendmail(sender, receiver, msg.as_string())
        smtp.quit()
        return user
    return False


def newpassword_send(password,email):
    user = user_business.get_by_email(email)
    if user:
        user['password'] = generate_password_hash(password)
        user.save()
        return user
    return False


def check_tourtip(user_ID):
    user = user_business.get_by_user_ID(user_ID)
    if user:
        return user
    return False


def no_tourtip(user_ID):
    user = user_business.get_by_user_ID(user_ID)
    if user:
        user['tourtip'] = "1"
        user.save()
        return user
    return False

def check_learning(user_ID):
    user = user_business.get_by_user_ID(user_ID)
    if user:
        return user
    return False

def no_learning(user_ID):
    user = user_business.get_by_user_ID(user_ID)
    if user:
        user['welcome'] = "1"
        user.save()
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


def send_verification_code(phone):
    """

    :param phone:
    :type phone:
    :return: {message_id: aalalals}
    :rtype:
    """
    url = "https://api.sms.jpush.cn/v1/codes"
    payload = json.dumps({
        'mobile': phone,
        'temp_id': 149269,
    })
    headers = {
        'content-type': "application/json",
        'authorization': "Basic MjZlZWFhM2QyNzljMzIyZTg0Zjk1NDQxOmYwMjQ2NzdiOWNjM2QxZWZmNDE0ODQxMA==",
    }
    response = requests.request("POST", url, data=payload, headers=headers)
    print("response", response)
    result = response.json()
    print("result", result)
    if "error" in result:
        raise Error(result["error"])
    msg_id = result["msg_id"]
    # 数据库 更改或者创建 get or create
    try:
        obj = PhoneMessageId.objects(phone=phone).get()
        obj.msg_id = msg_id
        return obj.save()
    except DoesNotExist as e:
        obj = PhoneMessageId(phone=phone, msg_id=msg_id)
        return obj.save()

    # if obj:
    #     obj.msg_id = msg_id
    #     return obj.save()
    # else:
    #     obj = PhoneMessageId(phone=phone, msg_id=msg_id)
    #     return obj.save()
    # phone_message_id = PhoneMessageId(phone=phone, msg_id=msg_id)
    # result = phone_message_id.save()
    # return result


def verify_code(code, phone):
    """

    :param code:
    :type code:
    :param phone:
    :type phone:
    :return: 验证成功返回 True, 失败抛出报错信息 {
        "code": *****,
        "message": "******"
    }
    :rtype:
    """
    msg_id = PhoneMessageId.objects(phone=phone).get().msg_id
    url = 'https://api.sms.jpush.cn/v1/codes/' + msg_id + '/valid'
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
        user = UserBusiness.get_by_user_ID(user_ID=user_ID)
        business_maper = {
            "app": AppBusiness,
            "module": ModuleBusiness,
            "request": UserRequestBusiness,
            "dataset": DatasetBusiness,
            "answer": RequestAnswerBusiness
        }
        business = business_maper[entity]
        # print("entity_id", entity_id)
        object = business.get_by_id(entity_id)

        if entity == "request" or entity =='answer':
            user_keyword = '{entity}_{action}'.format(action=action, entity=entity)
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
    def get_statistics(cls, user_ID, page_no, page_size, action, entity_type):
        """
        获取用户统计信息

        这里需要将 app, caller 从objectID转换成json吗？
        1. service可能被其他service调用，应该在route层转换
        2. 在其他service调用时也都需要转换，保证route调用结果一致
        :param user_ID:
        :type user_ID:
        :param page_no:
        :type page_no:
        :param page_size:
        :type page_size:
        :param action:
        :type action:
        :param entity_type:
        :type entity_type:
        :return:
        :rtype:
        """
        from server3.business.statistics_business import StatisticsBusiness
        user_obj = UserBusiness.get_by_user_ID(user_ID=user_ID)
        statistics = StatisticsBusiness.get_pagination(
            query={
                "action": action,
                "entity_type": entity_type,
                "caller": user_obj
            },
            page_no=page_no, page_size=page_size)
        for _object in statistics.objects:
            _object.app_obj_user_ID = _object.app.user.user_ID
        statistics.objects = json_utility.objs_to_json_with_args(
            statistics.objects, ["app", "caller"])
        return statistics

