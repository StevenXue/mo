import datetime

from server3.entity.world import World, MessageType
from server3.repository.general_repo import Repo
from server3.business.general_business import GeneralBusiness


class WorldBusiness(GeneralBusiness):
    repo = Repo(World)

    # TODO 推送到前端
    # 1. 用户发送
    @classmethod
    def user_send(cls, sender, channel, message):
        create_time = datetime.datetime.utcnow()
        world = World(
            create_time=create_time,
            sender=sender,
            channel=channel,
            message=message,
            message_type=MessageType.user
        )
        return cls.repo.create(world)

    # 2. 系统发送
    @classmethod
    def system_send(cls, channel, message):
        create_time = datetime.datetime.utcnow()
        world = World(
            create_time=create_time,
            channel=channel,
            message=message)
        return cls.repo.create(world)

