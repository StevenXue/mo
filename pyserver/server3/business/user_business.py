# -*- coding: UTF-8 -*-
from server3.entity.user import User
from server3.repository.user_repo import UserRepo
from server3.business.general_business import GeneralBusiness
from server3.entity.general_entity import Objects
from server3.entity.user_request import UserRequest
from server3.repository.user_request_repo import UserRequestRepo
from server3.repository.project_repo import ProjectRepo
from server3.entity.project import Project
from werkzeug.security import generate_password_hash

user_repo = UserRepo(User)


def add(user_ID, password, **kwargs):
    user = User(user_ID=user_ID, password=password, **kwargs)
    print("user", user)
    return user_repo.create(user)


def get_by_user_ID(user_ID):
    return user_repo.read_by_unique_field('user_ID', user_ID)


def get_by_email(email):
    return user_repo.read_by_unique_field('email', email)


def get_by_hashEmail(email, hashEmail):
    return user_repo.read_by_two_field('hashEmail', hashEmail, 'email', email)


def get_by_user_object_id(object_id):
    return user_repo.read_by_id(object_id)


def get_by_phone(phone):
    return user_repo.read_by_unique_field('phone', phone)


def remove_by_id(user_id):
    return user_repo.delete_by_id(user_id)


# def update_user_request_by_id(user_ID, **kwargs):
#     query = {'user_ID': user_ID}
#     return user_repo.update_one(query, kwargs)


class UserBusiness(GeneralBusiness):
    repo = UserRepo(User)

    @classmethod
    def get_by_user_ID(cls, user_ID):
        return cls.repo.read_by_unique_field('user_ID', user_ID)

    @classmethod
    def get_action_entity(cls, user_ID, page_no, page_size, action_entity,
                          type=None, search_query=None):
        user = cls.get_by_user_ID(user_ID=user_ID)
        start = (page_no - 1) * page_size
        end = page_no * page_size
        if action_entity == 'request_star':
            list_objects = getattr(user, action_entity)
            objectsId = [e.id for e in list_objects]
            if search_query:
                objects = UserRequestRepo(UserRequest). \
                    search(search_query,
                           q_dict={
                               'title': 'icontains',
                               'description': 'icontains',
                               'tags': 'icontains'
                           })
            else:
                objects = UserRequest.objects
            objects = objects.filter(id__in=objectsId)
            objects = objects(type=type)
        else:
            if search_query:
                list_objects = getattr(user, action_entity)
                objectsId = [e.id for e in list_objects]
                objects = ProjectRepo(Project). \
                    search(search_query,
                           q_dict={
                               'title': 'icontains',
                               'description': 'icontains',
                               'tags': 'icontains'
                           })
                objects = objects.filter(id__in=objectsId)
            else:
                objects = getattr(user, action_entity)
            objects.reverse()
        return Objects(
            objects=objects[start:end],
            count=len(objects),
            page_no=page_no,
            page_size=page_size)

    @classmethod
    def update_by_user_ID(cls, user_ID, update):
        user = get_by_user_ID(user_ID=user_ID)
        return cls.repo.update_one_by_id(obj_id=user.id, update=update)

    @classmethod
    def update_password(cls, user_ID, new_password):
        user = get_by_user_ID(user_ID=user_ID)
        user.password = generate_password_hash(new_password)
        user.save()


    # @classmethod
    # def checkTokenForUpdateInfo(cls):

    # @classmethod
    # def count_action_entity(cls, user_ID, page_no, page_size, action_entity,
    #                                  type, search_query):

    # @classmethod
    # def prepare(cls, user_ID, page_no, page_size):
    #     user = cls.get_by_user_ID(user_ID=user_ID)
    #     start = (page_no - 1) * page_size
    #     end = page_no * page_size
    #     return user, start, end
    #
    # @classmethod
    # def get(cls, user_ID, page_no, page_size, attr):
    #     user = cls.get_by_user_ID(user_ID=user_ID)
    #     start = (page_no - 1) * page_size
    #     end = page_no * page_size
    #     return Objects(
    #         objects=getattr(user, attr)[start:end],
    #         count=len(getattr(user, attr)),
    #         page_no=page_no,
    #         page_size=page_size)
    #
    # # method 1
    # @classmethod
    # def get_favor_apps(cls, user_ID, page_no, page_size):
    #     return cls.get(user_ID, page_no, page_size, "favor_apps")

    # method 2 对比一下 1 和 2
    # @classmethod
    # def get_favor_apps(cls, user_ID, page_no, page_size):
    #     user, start, end = cls.prepare(user_ID, page_no, page_size)
    #     return Objects(
    #         objects=user.favor_apps[start:end],
    #         count=len(user.favor_apps),
    #         page_no=page_no,
    #         page_size=page_size)

    # method 3
    # @classmethod
    # def get_favor_apps(cls, user_ID, page_no, page_size):
    #     user = cls.get_by_user_ID(user_ID=user_ID)
    #     start = (page_no - 1) * page_size
    #     end = page_no * page_size
    #     return Objects(objects=user.favor_apps[start:end],
    #                    count=len(user.favor_apps), page_no=page_no, page_size=page_size)

    # @classmethod
    # def get_star_apps(cls, user_ID, page_no, page_size):
    #     return cls.get(user_ID, page_no, page_size, "star_apps")


if __name__ == "__main__":
    pass
    # import sys
    # sys.path.append('../../')
    # user = get_by_user_ID(user_ID="bingwei")
    # print("user", user)
    # UserBusiness.get_favor_apps(user_ID="bingwei")
