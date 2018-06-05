# -*- coding: UTF-8 -*-

from mongoengine import DynamicDocument
from mongoengine import StringField
from mongoengine import DateTimeField
from mongoengine import ReferenceField
from mongoengine import ListField
from mongoengine import DictField
from mongoengine import IntField
from mongoengine import EmbeddedDocumentListField
from mongoengine import EmbeddedDocument
from mongoengine import PULL
from mongoengine import BooleanField

RE_TYPE = ('inactive', 'active', 'deploying')


class Commit(EmbeddedDocument):
    oldhexsha = StringField()
    newhexsha = StringField()
    actor_name = StringField()
    actor_email = StringField()
    timestamp = DateTimeField()
    message = StringField()
    version = StringField()


class Project(DynamicDocument):
    # required
    name = StringField(max_length=50, required=True)
    create_time = DateTimeField(required=True)
    update_time = DateTimeField(required=True)
    type = StringField(choices=('app', 'module', 'dataset'), required=True)
    hub_token = StringField(required=True)
    path = StringField(required=True)
    user = ReferenceField("User", required=True)
    privacy = StringField(choices=['private', 'public'], required=True)

    # optional
    description = StringField()
    overview = StringField()
    tb_port = StringField()
    repo_path = StringField()

    jobs = ListField(ReferenceField('Job'))
    # if forked project, which project fork from
    source_project = ReferenceField('Project')
    tags = ListField(StringField(max_length=50))
    favor_users = ListField(ReferenceField("User"))
    star_users = ListField(ReferenceField("User"))

    # TODO: To decide if delete these deprecated fields
    # deprecated
    datasets = ListField(ReferenceField('DataSet', reverse_delete_rule=PULL))
    related_tasks = ListField(StringField(max_length=50))
    related_fields = ListField(StringField(max_length=100))
    user_name = StringField(max_length=50)
    results = ListField(ReferenceField('Result', reverse_delete_rule=PULL))
    versions = ListField(StringField())
    commits = EmbeddedDocumentListField(Commit)

    auto_show_help = BooleanField(default=False)

    meta = {
        'allow_inheritance': True,
        'indexes': [
            {'fields': ['$name', '$description', '$path'],
             'default_language': "english",
             'weights': {'name': 10, 'description': 5, 'path': 5}
             }
        ]}


class Dataset(Project):
    size = IntField()  # by bytes
    dataset_path = StringField()


class Module(Project):
    category = StringField(choices=('model', 'toolkit'))
    module_path = StringField()
    input = DictField()
    output = DictField()
    status = StringField(choices=RE_TYPE)


class AppGetType:
    all = "all"
    favor = "favor"
    star = "star"
    used = "used"
    chat = 'chat'


class UsedModule(EmbeddedDocument):
    module = ReferenceField(Module)
    version = StringField()


class UsedDataset(EmbeddedDocument):
    dataset = ReferenceField(Dataset)
    version = StringField()


class Deployment(EmbeddedDocument):
    app_version = StringField()
    modules = EmbeddedDocumentListField(UsedModule)
    datasets = EmbeddedDocumentListField(UsedDataset)


class App(Project):
    # 继承Project
    # # 名称
    # name = StringField(max_length=50)
    # # 创建时间
    # create_time = DateTimeField()
    # # 更新时间
    # update_time = DateTimeField()
    # # api目的描述
    # description = StringField(max_length=50, required=True)
    # # 收藏这条api的用户
    # favor_users = ListField(ReferenceField("User"))
    # # 点赞这条api的用户
    # star_users = ListField(ReferenceField("User"))
    # # tags
    # tags = ListField(StringField())
    # # 发布者
    # user = ReferenceField("User")

    # api对应的网址尾缀如: /api/xxx/xxxx
    url = StringField(max_length=50)
    # 此条api对应的关键词匹配
    # keyword = StringField(max_length=30, unique=True, required=True)
    # 输入格式 url的额外信息 如body,parameters
    input = DictField()
    # 输出格式
    output = DictField()
    # api status
    status = StringField(choices=RE_TYPE)
    # 模拟的数据
    fake_response = StringField()
    # 调用次数
    usage_count = IntField(default=0)
    # 文档字符串
    doc = StringField()
    # 使用过的modules
    used_modules = EmbeddedDocumentListField(UsedModule)
    used_datasets = EmbeddedDocumentListField(UsedDataset)

    deployments = EmbeddedDocumentListField(Deployment)

    # app 路径
    app_path = StringField(default=None)

    # # http_req是get还是post 全部是post
    # http_req = StringField(required=True)

    # url = StringField(max_length=50)
    # used_modules = ListField(ReferenceField(Module))
    # keyword = StringField(max_length=30)
    # input = DictField()
    # output = DictField()
    # status = IntField(choices=RE_TYPE)
