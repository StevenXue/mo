# -*- coding: UTF-8 -*-
from server3.business import user_business
from server3.business import api_business

default_page_no = 1
default_page_size = 5


def get_favor_apis(user_ID, page_no=default_page_no, page_size=default_page_size):
    user = user_business.get_by_user_ID(user_ID=user_ID)
    start = (page_no - 1) * page_size
    end = page_no * page_size
    return user.favor_apis[start:end]


def test_get_favor_apis():
    get_favor_apis(user_ID='super_user')


if __name__ == '__main__':
    test_get_favor_apis()
