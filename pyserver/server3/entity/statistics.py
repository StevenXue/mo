# 记录用户在平台上的动作

from mongoengine import DynamicDocument
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import ReferenceField
from mongoengine import ListField
from mongoengine import DictField
from mongoengine import IntField
from mongoengine import PULL


OBJECT_TYPE = (
    (0, 'App'),
    (1, 'Module'),
    (2, 'Dataset'),
    (3, 'UserRequest'),
    (4, 'RequestAnswer'),
    (5, 'UserRequestComments')
)

# class ActionType:


ACTION_TYPE = ("favor", "star", 'use', "un_favor", "un_star", "create", "read")
ENTITY_TYPE = ("app", 'module', 'dataset', 'userRequest', 'requestAnswer', 'userRequestComments')


class Statistics(DynamicDocument):
    # 动作发起者
    caller = ReferenceField("User")
    # 对象类型
    entity_type = StringField(choices=ENTITY_TYPE)
    # 对象元素
    app = ReferenceField('App')
    module = ReferenceField('Module')
    dataset = ReferenceField('Dataset')
    userRequest = ReferenceField('UserRequest')
    requestAnswer = ReferenceField('RequestAnswer')
    userRequestComments = ReferenceField('UserRequestComments')

    # 动作
    action = StringField(choices=ACTION_TYPE)
    # 时间
    datetime = DateTimeField()

    # 使用输入
    input_json = DictField()
    # 使用输出
    output_json = DictField()
