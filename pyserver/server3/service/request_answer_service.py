# -*- coding: UTF-8 -*-
from server3.business import request_answer_business
from server3.business import user_business
from server3.business import ownership_business
from server3.service import ownership_service
from server3.service import message_service
from server3.business import user_request_business
from bson import ObjectId
from server3.service.user_request_service import EntityMapper
from server3.business.request_answer_business import RequestAnswerBusiness
from server3.utility import json_utility


def get_all_answer_by_user_ID(user_ID, page_no, page_size,type,
                              get_total_number=True):
    cls = RequestAnswerBusiness
    user = user_business.get_by_user_ID(user_ID)
    answers, total_number = cls. \
        get_by_answer_user(user,
                           get_total_number=get_total_number,
                           page_no=page_no,
                           page_size=page_size,
                           type = type)
    for answer in answers:
        answer.user_request_title = answer.user_request_id.title
    return answers, total_number


def get_all_answer_of_this_user_request(user_request_id, get_number=False,
                                        entity_type='requestAnswer'):
    # request_answer = request_answer_business. \
    #     get_all_answer_of_this_user_request(user_request)
    cls = EntityMapper.get(entity_type)
    request_answer = cls.get_by_user_request_id(user_request_id, get_number)
    return request_answer


def get_answer_number_of_this_user_request(user_request_id):
    request_answer_number = request_answer_business. \
        get_answer_number_of_this_user_request(user_request_id)
    return request_answer_number


def get_by_id(request_answer_id):
    request_answer = request_answer_business. \
        get_by_request_answer_id(request_answer_id)
    return request_answer


def create_request_answer(**data):
    # create a new request_answer object
    created_request_answer = request_answer_business. \
        add_request_answer(**data)
    if created_request_answer:
        # get user object
        user = data['answer_user']
        # create ownership relation
        if ownership_business.add(user,
                                  request_answer=
                                  created_request_answer):

            #  新建通知消息
            admin_user = user_business.get_by_user_ID('admin')
            user_request = user_request_business. \
                get_by_user_request_id(data['user_request'])
            receivers = list({'obj_id': el} for el in user_request.star_user)
            if message_service.create_message(
                    sender=admin_user,
                    message_type='answer',
                    receivers=receivers,
                    title='Notification',
                    user=user,
                    user_request=user_request,
            ):
                return created_request_answer
            else:
                raise RuntimeError(
                    'Cannot create message of the new request_answer')
        else:
            raise RuntimeError(
                'Cannot create ownership of the new request_answer')
    else:
        raise RuntimeError('Cannot create the new request_answer')


def accept_request_answer(user_request_id, user_ID, request_answer_id):
    user_request = user_request_business. \
        get_by_user_request_id(user_request_id)
    ownership = ownership_business.get_ownership_by_owned_item(
        user_request, 'user_request'
    )
    if ownership.user.user_ID != user_ID:
        raise RuntimeError(
            'this request not belong to this user, cannot update')
    else:
        user_request_business.update_user_request_by_id(
            user_request_id=user_request_id,
            accept_answer=ObjectId(request_answer_id)
        )


def update_request_answer(request_answer_id, user_id, answer):
    request_answer = request_answer_business. \
        get_by_request_answer_id(request_answer_id)
    ownership = ownership_business.get_ownership_by_owned_item(
        request_answer, 'request_answer'
    )
    if ownership.user.user_ID != user_id:
        raise RuntimeError(
            'this request not belong to this user, cannot update')
    else:
        request_answer_business.update_request_answer_by_id(
            request_answer_id=request_answer_id,
            answer=answer
        )


def list_request_answer_by_user_id(user_ID, order=-1):
    user = user_business.get_by_user_ID(user_ID)
    request_answer = ownership_business. \
        get_ownership_objects_by_user(user, 'request_answer')
    if order == -1:
        request_answer.reverse()
    return request_answer


def remove_request_answer_by_id(request_answer_id, user_ID):
    request_answer = request_answer_business. \
        get_by_request_answer_id(request_answer_id)
    # check ownership
    ownership = ownership_business. \
        get_ownership_by_owned_item(
        request_answer, 'request_answer')
    if user_ID != ownership.user.user_ID:
        raise ValueError('this request not belong to this user, cannot delete')
    return request_answer_business.remove_by_id(request_answer_id)
