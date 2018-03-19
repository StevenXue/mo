from server3.service import logger_service

from server3.business.world_business import WorldBusiness
from server3.business.user_business import UserBusiness


class WorldService:
    # 1. 用户发送
    @classmethod
    def user_send(cls, user_ID, channel, message):
        sender = UserBusiness.get_by_user_ID(user_ID)
        world = WorldBusiness.user_send(sender=sender, channel=channel, message=message)

        # world.sender_user_ID = world.sender.user_ID
        logger_service.emit_world_message(world)
        return world

    @classmethod
    def system_send(cls, channel, message):
        # 记录世界频道消息
        world = WorldBusiness.system_send(channel, message)
        # world.sender_user_ID = world.sender.user_ID
        logger_service.emit_world_message(world)
        return world

