# -*- coding: UTF-8 -*-

from entity.ownership import Ownership
from entity.user import User
from repository.ownership_repo import OwnershipRepo

ownership_repo = OwnershipRepo(Ownership)


def add(user, is_private, **owned_obj):
    # owned = owned_obj['project'] or owned_obj['data_set'] or \
    #         owned_obj['model'] or owned_obj['toolkit'] or owned_obj['file']
    if not 0 < len(owned_obj.items()) <= 1:
        raise ValueError('invalid owned_obj')
    if not isinstance(user, User) or not isinstance(is_private, bool):
        raise ValueError('no user or no private')
    ownership_obj = Ownership(user=user, private=is_private, **owned_obj)
    # ownership_obj = Ownership(user=user, private=if_private, **(file='abc'))
    return ownership_repo.create(ownership_obj)


def get_ownership_by_user(user):
    ownership = Ownership(user=user)
    return ownership_repo.read_by_user(ownership)


def get_ownership_by_type_and_private(owned_type, is_private):
    ownership = Ownership(private=is_private)
    return ownership_repo.read_by_type_and_private(owned_type, ownership)
