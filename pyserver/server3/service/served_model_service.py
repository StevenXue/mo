# -*- coding: UTF-8 -*-
from server3.business import user_business
from server3.business import ownership_business
from server3.business import served_model_business


def add(user_ID, name, description, server, signatures, input_type,
        model_base_path, is_private=False):
    """
    add a served model
    :param user_ID:
    :param is_private:
    :param name:
    :param description:
    :param server:
    :param signatures:
    :param input_type:
    :param model_base_path:
    :return:
    """
    served_model = served_model_business.add(name, description, server,
                                             signatures, input_type,
                                             model_base_path)
    user = user_business.get_by_user_ID(user_ID)
    ownership_business.add(user, is_private, served_model=served_model)
    return served_model
