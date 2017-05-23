
from entity.ownership import Ownership
from repository.ownership_repo import OwnershipRepo

ownership_repo = OwnershipRepo(Ownership)


def add(user, if_private, **owned_obj):
    # owned = owned_obj['project'] or owned_obj['data_set'] or \
    #         owned_obj['model'] or owned_obj['toolkit'] or owned_obj['file']
    if not 0 < len(owned_obj.items()) <= 1:
        raise ValueError('invalid owned_obj')
    if not user or not if_private:
        raise ValueError('no user or no private')
    ownership_obj = Ownership(user=user, private=if_private, **owned_obj)
    return ownership_repo.create(ownership_obj)

