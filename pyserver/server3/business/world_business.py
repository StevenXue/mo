import datetime

from server3.entity.world import World
from server3.repository.general_repo import Repo

world_repo = Repo(World)


def get(**kwargs):
    return world_repo.read(kwargs)


def get_by_api_id(api_id):
    return world_repo.read_by_id(api_id)


def add(**kwargs):
    """
    根据 name, userId 生成url
    未来提供自定义 url
    :param name:
    :type name:
    :param user:
    :type user:
    :param kwargs:
    :type kwargs:
    :return:
    :rtype:
    """
    create_time = datetime.datetime.utcnow()
    world = World(create_time=create_time, **kwargs)
    return world_repo.create(world)


# 1. 用户发送
def user_send(sender, channel, message):
    return add(sender=sender, channel=channel, message=message)


# 新建需求。
# 2. 系统发送
def system_send(channel, message):
    return add(channel=channel, message=message)


def create_message():
    return