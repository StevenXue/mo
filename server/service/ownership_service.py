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


# def check_ownership(user, owned):

