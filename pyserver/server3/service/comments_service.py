# -*- coding: UTF-8 -*-
from server3.business import comments_business
from server3.business import user_business
from server3.business import ownership_business
from server3.service import ownership_service


def get_comments_of_this_user_request(user_request_id):
    user_request_comments = comments_business. \
        get_comments_of_this_user_request(user_request_id)
    return user_request_comments


def count_comments_of_this_user_request(user_request_id):
    count = comments_business.count_comments_of_this_user_request(user_request_id)
    return count


def get_comments_of_this_answer(request_answer_id):
    user_request_comments = comments_business. \
        get_comments_of_this_answer(request_answer_id)
    return user_request_comments



def get_by_id(user_request_comments_id):
    user_request_comments = comments_business.\
        get_by_user_request_comments_id(user_request_comments_id)
    return user_request_comments


def create_user_request_comments(user_request_id, user_ID, comments,
                                 comments_type,request_answer_id):
    # create a new user_request_comments object
    created_user_request_comments = comments_business.\
        add_user_request_comments(user_request_id=user_request_id,
                                  comments_user_ID=user_ID,
                                  comments=comments,
                                  comments_type=comments_type,
                                  request_answer_id=request_answer_id)
    if created_user_request_comments:
        # get user object
        user = user_business.get_by_user_ID(user_ID=user_ID)
        # create ownership relation
        if ownership_business.add(user,
                                  user_request_comments=
                                  created_user_request_comments):
            return created_user_request_comments
        else:
            raise RuntimeError(
                'Cannot create ownership of the new user_request_comments')
    else:
        raise RuntimeError('Cannot create the new user_request_comments')


def update_user_request_comments(user_request_comments_id, user_ID, comments):
    user_request_comments = comments_business.\
        get_by_user_request_comments_id(user_request_comments_id)
    ownership = ownership_business.get_ownership_by_owned_item(
        user_request_comments, 'user_request_comments'
    )
    if ownership.user.user_ID != user_ID:
        raise RuntimeError(
            'this request not belong to this user, cannot update')
    else:
        comments_business.update_user_request_comments_by_id(
            user_request_comments_id=user_request_comments_id,
            comments=comments
        )


def list_user_request_comments_by_user_id(user_ID, order=-1):
    user = user_business.get_by_user_ID(user_ID)
    user_request_comments = ownership_business. \
            get_ownership_objects_by_user(user, 'user_request_comments')
    if order == -1:
        user_request_comments.reverse()
    return user_request_comments


def remove_user_request_comments_by_id(user_request_comments_id, user_ID):
    user_request_comments = comments_business.\
        get_by_user_request_comments_id(user_request_comments_id)
    # check ownership
    ownership = ownership_business.\
        get_ownership_by_owned_item(
            user_request_comments, 'user_request_comments')
    if user_ID != ownership.user.user_ID:
        raise ValueError('this request not belong to this user, cannot delete')
    return comments_business.remove_by_id(user_request_comments_id)

