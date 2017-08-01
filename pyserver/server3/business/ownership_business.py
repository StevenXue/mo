# -*- coding: UTF-8 -*-
from server3.entity.ownership import Ownership
from server3.entity.user import User
from server3.repository.ownership_repo import OwnershipRepo

ownership_repo = OwnershipRepo(Ownership)


def add(user, is_private, **owned_obj):
    # owned = owned_obj['project'] or owned_obj['data_set'] or \
    #         owned_obj['model'] or owned_obj['toolkit'] or owned_obj['file']
    if not 0 < len(list(owned_obj.items())) <= 1:
        raise ValueError('invalid owned_obj')
    if not isinstance(user, User) or not isinstance(is_private, bool):
        raise ValueError('no user or no private')
    ownership_obj = Ownership(user=user, private=is_private, **owned_obj)
    # ownership_obj = Ownership(user=user, private=if_private, **(file='abc'))
    return ownership_repo.create(ownership_obj)


# def get_ownerships_by_owned_item(owned_item, item_type):
#     return ownership_repo.read_by_non_unique_field(item_type, owned_item)


def get_ownership_by_owned_item(owned_item, item_type):
    return ownership_repo.read_by_item(item_type, owned_item)


# def remove_ownerships_by_owned_item(owned_item, item_type):
#     return ownership_repo.delete_by_non_unique_field(item_type, owned_item)
#
#
# def remove_ownership_by_user_and_owned_item(user, owned_item, item_type):
#     return ownership_repo.delete_by_user_and_item(user, owned_item, item_type)


def update_by_id(ownership_id, **update):
    ownership_repo.update_one_by_id(ownership_id, update)


def list_ownership_by_user(user):
    return ownership_repo.read_by_non_unique_field('user', user)


def list_ownership_by_type_and_private(owned_type, is_private):
    return ownership_repo.read_by_type_and_private(owned_type, is_private)
