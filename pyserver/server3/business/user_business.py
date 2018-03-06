# -*- coding: UTF-8 -*-
from server3.entity.user import User
from server3.repository.user_repo import UserRepo
from server3.business.general_business import GeneralBusiness
from server3.entity.general_entity import Objects

user_repo = UserRepo(User)


def add(user_ID, password, kwargs):
    user = User(user_ID=user_ID, password=password, **kwargs)
    print("user", user)
    return user_repo.create(user)


def get_by_user_ID(user_ID):
    return user_repo.read_by_unique_field('user_ID', user_ID)


def get_by_user_object_id(object_id):
    return user_repo.read_by_id(object_id)


def get_by_phone(phone):
    return user_repo.read_by_unique_field('phone', phone)


def remove_by_id(user_id):
    return user_repo.delete_by_id(user_id)


def update_user_request_by_id(user_ID, **kwargs):
    query = {'user_ID': user_ID}
    return user_repo.update_one(query, kwargs)


class UserBusiness(GeneralBusiness):
    repo = UserRepo(User)

    @classmethod
    def get_favor_apps(cls, user_ID, page_no, page_size):
        user = cls.get_by_user_ID(user_ID=user_ID)
        start = (page_no - 1) * page_size
        end = page_no * page_size
        return Objects(objects=user.favor_apps[start:end],
                       count=len(user.favor_appss), page_no=page_no, page_size=page_size)


    @classmethod
    def get_star_apps(cls, user_ID):
        user = cls.get_by_user_ID(user_ID=user_ID)
        return user.star_apps

    @classmethod
    def get_by_user_ID(cls, user_ID):
        return cls.repo.read_by_unique_field('user_ID', user_ID)


if __name__ == "__main__":
    # import sys
    # sys.path.append('../../')
    # user = get_by_user_ID(user_ID="bingwei")
    # print("user", user)
    UserBusiness.get_favor_apps(user_ID="bingwei")
