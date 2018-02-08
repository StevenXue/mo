# -*- coding: UTF-8 -*-
from server3.business import request_answer_business
from server3.business import user_business
from server3.business import ownership_business
from server3.service import ownership_service


def get_all_answer_of_this_user_request(user_request_id):
    print('user_request_id')
    print(user_request_id)
    request_answer = request_answer_business. \
        get_all_answer_of_this_user_request(user_request_id)
    print(request_answer)
    return request_answer


def get_by_id(request_answer_id):
    request_answer = request_answer_business. \
        get_by_request_answer_id(request_answer_id)
    return request_answer


def create_request_answer(user_request_id, user_id, answer):
    # create a new request_answer object
    created_request_answer = request_answer_business. \
        add_request_answer(user_request_id=user_request_id,
                           answer_user_id=user_id,
                           answer=answer)
    if created_request_answer:
        # get user object
        user = user_business.get_by_user_ID(user_ID=user_id)
        # create ownership relation
        if ownership_business.add(user,
                                  request_answer=
                                  created_request_answer):
            return created_request_answer
        else:
            raise RuntimeError(
                'Cannot create ownership of the new request_answer')
    else:
        raise RuntimeError('Cannot create the new request_answer')


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


def list_request_answer_by_user_id(user_id, order=-1):
    request_answer = ownership_service. \
        get_ownership_objects_by_user_ID(user_id, 'request_answer')
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
