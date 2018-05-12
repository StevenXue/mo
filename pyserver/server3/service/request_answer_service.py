# -*- coding: UTF-8 -*-
from server3.business import request_answer_business
from server3.business.user_business import UserBusiness
from server3.business import ownership_business
from server3.service import ownership_service
from server3.service.message_service import MessageService
from server3.business import user_request_business
from server3.business.user_request_business import UserRequestBusiness

from bson import ObjectId
# from server3.service.user_request_service import EntityMapper
from server3.business.request_answer_business import RequestAnswerBusiness
from server3.utility import json_utility
from server3.business.general_business import GeneralBusiness
from server3.service.world_service import WorldService
from server3.business.statistics_business import StatisticsBusiness
from server3.entity.world import CHANNEL
from server3.service.world_service import WorldService
from server3.business.statistics_business import StatisticsBusiness
from server3.entity.world import CHANNEL


# def get_all_answer_by_user_ID(user_ID, page_no, page_size, type, search_query,
#                               get_total_number=True):
#     cls = RequestAnswerBusiness
#     user = UserBusiness.get_by_user_ID(user_ID)
#     answers, total_number = cls. \
#         get_by_answer_user(user,
#                            search_query=search_query,
#                            get_total_number=get_total_number,
#                            page_no=page_no,
#                            page_size=page_size,
#                            type=type)
#     for answer in answers:
#         answer.user_request_title = answer.user_request.title
#     return answers, total_number
#
#
# def get_all_answer_of_this_user_request(user_request_id, get_number=False,
#                                         entity_type='requestAnswer'):
#     # request_answer = request_answer_business. \
#     #     get_all_answer_of_this_user_request(user_request)
#     cls = EntityMapper.get(entity_type)
#     request_answer = cls.get_by_user_request_id(user_request_id, get_number)
#     return request_answer
#
#
# def get_answer_number_of_this_user_request(user_request_id):
#     request_answer_number = request_answer_business. \
#         get_answer_number_of_this_user_request(user_request_id)
#     return request_answer_number
#
#
# def get_by_id(request_answer_id):
#     request_answer = request_answer_business. \
#         get_by_request_answer_id(request_answer_id)
#     return request_answer
#
#
# def create_request_answer(**data):
#     # create a new request_answer object
#     created_request_answer = request_answer_business. \
#         add_request_answer(**data)
#     if created_request_answer:
#         # get user object
#         user = data['answer_user']
#         user_request = user_request_business. \
#             get_by_user_request_id(data['user_request'])
#
#         from server3.service.world_service import WorldService
#         from server3.business.statistics_business import StatisticsBusiness
#         from server3.entity.world import CHANNEL
#
#         # 记录历史记录
#         statistics = StatisticsBusiness.action(
#             user_obj=user,
#             entity_obj=created_request_answer,
#             entity_type="requestAnswer",
#             action="create"
#         )
#
#         # 记录世界频道消息  # 推送消息
#         world = WorldService.system_send(
#             channel=CHANNEL.request,
#             message=f"用户{created_request_answer.answer_user.user_ID}为需求"
#                     f"{user_request.title}创建了回答")
#
#         # create ownership relations
#         #  新建通知消息
#         admin_user = UserBusiness.get_by_user_ID('admin')
#
#         receivers = [el for el in user_request.star_user]
#         if message_service.create_message(
#                 sender=admin_user,
#                 message_type='answer',
#                 receivers=receivers,
#                 user=user,
#                 title='Notification',
#                 user_request=user_request,
#         ):
#             return created_request_answer
#         else:
#             raise RuntimeError(
#                 'Cannot create message of the new request_answer')
#
#     else:
#         raise RuntimeError('Cannot create the new request_answer')
#
#
# def accept_request_answer(user_request_id, user_ID, request_answer_id):
#     user_request = user_request_business. \
#         get_by_user_request_id(user_request_id)
#     ownership = ownership_business.get_ownership_by_owned_item(
#         user_request, 'user_request'
#     )
#     if ownership.user.user_ID != user_ID:
#         raise RuntimeError(
#             'this request not belong to this user, cannot update')
#     else:
#         user_request_business.update_user_request_by_id(
#             user_request_id=user_request_id,
#             accept_answer=ObjectId(request_answer_id)
#         )
#
#
# def update_request_answer(request_answer_id, user_id, answer):
#     request_answer = request_answer_business. \
#         get_by_request_answer_id(request_answer_id)
#     ownership = ownership_business.get_ownership_by_owned_item(
#         request_answer, 'request_answer'
#     )
#     if ownership.user.user_ID != user_id:
#         raise RuntimeError(
#             'this request not belong to this user, cannot update')
#     else:
#         request_answer_business.update_request_answer_by_id(
#             request_answer_id=request_answer_id,
#             answer=answer
#         )
#
#
# def list_request_answer_by_user_id(user_ID, order=-1):
#     user = UserBusiness.get_by_user_ID(user_ID)
#     request_answer = ownership_business. \
#         get_ownership_objects_by_user(user, 'request_answer')
#     if order == -1:
#         request_answer.reverse()
#     return request_answer
#
#
# def remove_request_answer_by_id(request_answer_id, user_ID):
#     request_answer = request_answer_business. \
#         get_by_request_answer_id(request_answer_id)
#     # check ownership
#     ownership = ownership_business. \
#         get_ownership_by_owned_item(
#         request_answer, 'request_answer')
#     if user_ID != ownership.user.user_ID:
#         raise ValueError('this request not belong to this user, cannot delete')
#     return request_answer_business.remove_by_id(request_answer_id)


class RequestAnswerService:
    @classmethod
    def get_all_answer_by_user_ID(cls, user_ID, page_no, page_size,
                                  type, search_query):
        user = UserBusiness.get_by_user_ID(user_ID)
        answers, total_number = RequestAnswerBusiness. \
            get_by_answer_user(user,
                               search_query=search_query,
                               page_no=page_no,
                               page_size=page_size,
                               type=type)
        for answer in answers:
            answer.user_request_title = answer.user_request.title
        return answers, total_number

    @classmethod
    def accept_answer(cls, user_request_id, user_ID, request_answer_id):
        request_answer = RequestAnswerBusiness.get_by_id(request_answer_id)
        UserRequestBusiness.update_by_id(
            user_request_id=user_request_id,
            accept_answer=request_answer
        )

    @classmethod
    def create_request_answer(cls, **data):
        # create a new request_answer object
        created_request_answer = RequestAnswerBusiness. \
            add_request_answer(**data)
        if created_request_answer:
            # get user object
            user = data['answer_user']
            user_request = UserRequestBusiness. \
                get_by_id(data['user_request'])

            # 记录历史记录
            statistics = StatisticsBusiness.action(
                user_obj=user,
                entity_obj=created_request_answer,
                entity_type="requestAnswer",
                action="create"
            )

            # 记录世界频道消息  # 推送消息
            world = WorldService.system_send(
                channel=CHANNEL.request,
                message=f"用户{created_request_answer.answer_user.user_ID}为需求"
                        f"{user_request.title}创建了回答")

            # create ownership relations
            #  新建通知消息
            admin_user = UserBusiness.get_by_user_ID('admin')

            receivers = [user_request.user.id]
            receivers += [el for el in user_request.star_user]

            if MessageService.create_message(
                    sender=admin_user,
                    message_type='answer',
                    receivers=receivers,
                    user=user,
                    title='Notification',
                    user_request=user_request,
            ):
                return created_request_answer
            else:
                raise RuntimeError(
                    'Cannot create message of the new request_answer')

        else:
            raise RuntimeError('Cannot create the new request_answer')

    # @classmethod
    # def update_request_answer(cls, request_answer_id, answer):
    #     RequestAnswerBusiness.update_request_answer_by_id(
    #         request_answer_id=request_answer_id,
    #         answer=answer
    #     )

    # @classmethod
    # def remove_answer_by_id(cls, request_answer_id, user_ID):
    #     return RequestAnswerBusiness.remove_by_id(request_answer_id, user_ID)

    # @classmethod
    # def get_all_answer_of_this_user_request(cls, user_request_id):
    #     request_answer = RequestAnswerBusiness.get_by_user_request_id(
    #         user_request_id)
    #     return request_answer

