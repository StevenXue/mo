# -*- coding: UTF-8 -*-

from server3.entity.world import CHANNEL
from server3.business.user_request_business import UserRequestBusiness
from server3.business.request_answer_business import RequestAnswerBusiness
from server3.business.user_business import UserBusiness
from server3.business.statistics_business import StatisticsBusiness
from server3.business.comments_business import CommentsBusiness
from server3.service.world_service import WorldService
from server3.service.user_service import UserService


class UserRequestService:
    @classmethod
    def get_list(cls, type, search_query, user_ID, page_no, page_size):
        user = UserBusiness.get_by_user_ID(user_ID) if user_ID else None
        user_request, total_number = UserRequestBusiness. \
            get_list(type, search_query, user, False, page_no, page_size)
        return user_request, total_number

    @classmethod
    def get_by_id(cls, user_request_id):
        user_request = UserRequestBusiness.get_by_id(user_request_id)
        return user_request

    @classmethod
    def remove_by_id(cls, user_request_id, user_ID):
        if (CommentsBusiness.get_comments_of_this_user_request(user_request_id)
                or RequestAnswerBusiness.get_by_user_request_id(
                    user_request_id)):
            raise RuntimeError('Cannot delete user_request')
        return UserRequestBusiness.remove_by_id(user_request_id, user_ID)

    @classmethod
    def remove_by_user_ID(cls, user_ID):
        user = UserBusiness.get_by_user_ID(user_ID)
        return UserRequestBusiness.remove_all_by_user(user)

    @classmethod
    def create_user_request(cls, title, user_ID, **kwargs):
        # create a new user_request object
        user = UserBusiness.get_by_user_ID(user_ID)
        created_user_request = UserRequestBusiness.add_user_request(
            title=title,
            user=user,
            status=0,
            **kwargs)

        # 记录历史记录
        statistics = StatisticsBusiness.action(
            user_obj=user,
            entity_obj=created_user_request,
            entity_type="userRequest",
            action="create"
        )

        # 记录世界频道消息  # 推送消息
        world = WorldService.system_send(
            channel=CHANNEL.request,
            message=f"用户{created_user_request.user.user_ID}" +
                    f"发布了需求{created_user_request.title}")

        if created_user_request:
            user_entity = UserService. \
                action_entity(user_ID=user_ID,
                              entity_id=created_user_request.id,
                              action='star', entity='request')
            return user_entity.entity
        else:
            raise RuntimeError('Cannot create the new user_request')

    @classmethod
    def update_user_request(cls, user_request_id, **kwargs):
        return UserRequestBusiness.update_by_id(
            user_request_id=user_request_id, **kwargs)

# def get_user_request_list():
#     user_requests = user_request_business.get_all_user_request()  # 分页
#     return user_requests.order_by('-create_time')


# def get_all_user_request():
#     user_request = user_request_business.get_all_user_request()
#     return user_request

#
# def list_user_request_by_user_ID(user_ID, order=-1):
#     user = user_business.get_by_user_ID(user_ID)
#     user_request = ownership_business. \
#         get_ownership_objects_by_user(user, 'user_request')
#     if order == -1:
#         user_request.reverse()
#     return user_request

#
# def get_list(type, search_query, user_ID, page_no, page_size):
#     user = UserBusiness.get_by_user_ID(user_ID) if user_ID else None
#     user_request, total_number = UserRequestBusiness. \
#         get_list(type, search_query, user, False, page_no, page_size,
#                  get_total_number=True)
#     return user_request, total_number
#
#
# def get_by_id(user_request_id):
#     user_request = UserRequestBusiness.get_by_id(user_request_id)
#     return user_request
#
#
# def remove_by_id(user_request_id, user_ID):
#     return UserRequestBusiness.remove_by_id(user_request_id, user_ID)
#
#
# def remove_by_user_ID(user_ID):
#     user = user_business.get_by_user_ID(user_ID)
#     return UserRequestBusiness.remove_all_by_user(user)
#
#
# def create_request_message(request):
#     # tmp = "用户super_user发布了需求匹配夫妻脸"
#     user = request.user
#     return "用户{}发布了需求{}".format(user.name, request.title)
#
#
# def create_user_request(title, user_ID, **kwargs):
#     # create a new user_request object
#     user = user_business.get_by_user_ID(user_ID)
#     created_user_request = user_request_business.add_user_request(
#         title=title,
#         user=user,
#         status=0,
#         **kwargs)
#
#     # 记录历史记录
#     statistics = StatisticsBusiness.action(
#         user_obj=user,
#         entity_obj=created_user_request,
#         entity_type="userRequest",
#         action="create"
#     )
#
#     # 记录世界频道消息  # 推送消息
#     world = WorldService.system_send(
#         channel=CHANNEL.request,
#         message=f"用户{created_user_request.user.user_ID}发布了需求{created_user_request.title}")
#
#     if created_user_request:
#         # 默认发布者star
#         created_user_request = user_service.update_request_star(
#             created_user_request.id, user_ID)
#
#         # get user object
#         user = user_business.get_by_user_ID(user_ID=user_ID)
#         # create ownership relation
#         if ownership_business.add(user, user_request=created_user_request):
#             return created_user_request
#         else:
#             raise RuntimeError(
#                 'Cannot create ownership of the new user_request')
#     else:
#         raise RuntimeError('Cannot create the new user_request')
#
#
# def update_user_request(user_request_id, **kwargs):
#     return UserRequestBusiness.update_user_request_by_id(
#         user_request_id=user_request_id, **kwargs)
