from business import user_business
from business import ownership_business


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
    ownerships = ownership_business.list_ownership_by_type_and_private(
        owned_type, True)
    if owned in [ownership[owned_type] for ownership in ownerships]:
        return True
    return False


def check_ownership(user_ID, owned, owned_type):
    user = user_business.get_by_user_ID(user_ID)
    ownerships = ownership_business.list_ownership_by_user(user)
    owned_list = [os[owned_type] for os in ownerships]
    if owned in owned_list:
        return True
    else:
        return False
