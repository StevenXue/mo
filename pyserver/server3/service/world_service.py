from server3.business.world_business import WorldBusiness
from server3.business.user_business import UserBusiness


class WorldService:
    # 1. 用户发送
    @classmethod
    def user_send(cls, user_ID, channel, message):
        sender = UserBusiness.get_by_user_ID(user_ID)
        return WorldBusiness.user_send(sender=sender, channel=channel, message=message)

