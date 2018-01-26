# -*- coding: UTF-8 -*-
from operator import itemgetter

from server3.business import user_business
from server3.business import ownership_business


def get_all_user_request(owned_type):
    ownerships = ownership_business.list_ownership_by_type(owned_type)
    return [get_owned_item_with_user(os, owned_type) for os in ownerships if
            owned_type in os]


def get_ownership_objects_by_user_ID(user_ID, owned_type):
    """
    get different type of objects belong to a user, by user_Id
    :param user_ID:
    :param owned_type: object type
    :return: list of objects
    """
    ownerships = list_by_user_ID(user_ID)
    ow_list = []
    for os in ownerships:
        if owned_type in os:
            item = os[owned_type]
            item.is_private = os.private
            ow_list.append(item)
    return ow_list


def get_privacy_ownership_objects_by_user_ID(user_ID, owned_type,
                                             private=True):
    """
    get different type of objects belong to a user, by user_Id
    :param user_ID:
    :param owned_type: object type
    :return: list of objects
    """
    ownerships = list_by_user_ID(user_ID)
    ow_list = []
    for os in ownerships:
        if owned_type in os and os['private'] is private:
            item = os[owned_type]
            item.is_private = os.private
            ow_list.append(item)
    return ow_list


def get_all_public_objects(owned_type):
    ownerships = ownership_business.list_ownership_by_type_and_private(
        owned_type, False)
    return [get_owned_item_with_user(os, owned_type) for os in ownerships if
            owned_type in os]


def get_all_public_projects_of_others(user_ID):
    user = user_business.get_by_user_ID(user_ID)
    ownerships = ownership_business.list_ownership_by_type_and_private(
        'project', False)
    projects = [get_owned_item_with_user(os, 'project') for os in ownerships if os.user != user]
    new_projects = sorted(projects, key=itemgetter('create_time'), reverse=True)
    return new_projects


def get_owned_item_with_user(os, owned_type):
    item = os[owned_type]
    item['user_name'] = os.user.name
    return item


def list_by_user_ID(user_ID):
    """
    list all owned items of a user, by user_ID
    :param user_ID:
    :return: ownership list
    """
    user = user_business.get_by_user_ID(user_ID)
    if user:
        return ownership_business.list_ownership_by_user(user)
    else:
        raise NameError('no user found')


def check_private(owned, owned_type):
    """
    check if the object is private
    :param owned:
    :param owned_type:
    :return: True for private, False for public
    """
    return ownership_business.get_ownership_by_owned_item(owned, owned_type).private is True


def check_ownership(user_ID, owned, owned_type):
    """
    check if object owned by user
    :param user_ID:
    :param owned:
    :param owned_type:
    :return:
    """
    return ownership_business.get_owner(owned, owned_type).user_ID == user_ID
