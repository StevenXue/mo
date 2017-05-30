# -*- coding: UTF-8 -*-
from business import user_business
from business import ownership_business
from entity.project import Project


def get_ownership_objects_by_user_ID(user_ID, owned_type):
    """
    get different type of objects belong to a user, by user_Id
    :param user_ID:
    :param owned_type: object type
    :return: list of objects
    """
    ownerships = list_by_user_ID(user_ID)
    return [os[owned_type] for os in ownerships if owned_type in os]


def get_all_public_objects(owned_type):
    return ownership_business.list_ownership_by_type_and_private(owned_type,
                                                                 False)


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
    ownerships = ownership_business.list_ownership_by_type_and_private(
        owned_type, True)
    if owned in [ownership[owned_type] for ownership in ownerships if
                 owned_type in ownership]:
        return True
    return False


def check_ownership(user_ID, owned, owned_type):
    """
    check if object owned by user
    :param user_ID:
    :param owned:
    :param owned_type:
    :return:
    """
    user = user_business.get_by_user_ID(user_ID)
    ownerships = ownership_business.list_ownership_by_user(user)
    owned_list = [os[owned_type] for os in ownerships]
    if owned in owned_list:
        return True
    else:
        return False
