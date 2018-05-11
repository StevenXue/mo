from mongoengine import CASCADE
from mongoengine import NULLIFY
from mongoengine import PULL

from server3.entity.staging_data_set import StagingDataSet
from server3.entity.toolkit import Toolkit
from server3.entity.model import Model
from server3.entity.data_set import DataSet
from server3.entity.served_model import ServedModel
from server3.entity.job import Job
from server3.entity.result import Result
from server3.entity.project import Project
from server3.entity.file import File
from server3.entity.project import *
from server3.entity.user import User
from server3.entity.data import Data
from server3.entity.ownership import Ownership
from server3.entity.user_request import UserRequest
from server3.entity.comments import Comments
from server3.entity.request_answer import RequestAnswer
from server3.entity.api import Api
from server3.entity.statistics import Statistics


# ——————————————————————————————————————————————————————— external delete rules
#                                            Defined here to avoid import loops
Project.register_delete_rule(Job, 'project', CASCADE)
DataSet.register_delete_rule(File, 'data_set', CASCADE)
File.register_delete_rule(DataSet, 'file', NULLIFY)
UserRequest.register_delete_rule(User, 'request_star', PULL)

# 删除 user
User.register_delete_rule(App, 'star_users', PULL)
User.register_delete_rule(App, 'favor_users', PULL)
User.register_delete_rule(Module, 'star_users', PULL)
User.register_delete_rule(Module, 'favor_users', PULL)
User.register_delete_rule(Dataset, 'star_users', PULL)
User.register_delete_rule(Dataset, 'favor_users', PULL)
User.register_delete_rule(UserRequest, 'star_user', PULL)
User.register_delete_rule(UserRequest, 'votes_up_user', PULL)


# 删除 job
Job.register_delete_rule(App, 'jobs', PULL)
Job.register_delete_rule(Module, 'jobs', PULL)
Job.register_delete_rule(Dataset, 'jobs', PULL)

# 删除 app
App.register_delete_rule(User, 'favor_apps', PULL)
App.register_delete_rule(User, 'star_apps', PULL)
App.register_delete_rule(Statistics, 'app', CASCADE)
App.register_delete_rule(Job, 'app', CASCADE)

# 删除 module
Module.register_delete_rule(User, 'favor_modules', PULL)
Module.register_delete_rule(User, 'star_modules', PULL)
Module.register_delete_rule(Statistics, 'module', CASCADE)
Module.register_delete_rule(Job, 'module', CASCADE)

# 删除 dataset
Dataset.register_delete_rule(User, 'favor_datasets', PULL)
Dataset.register_delete_rule(User, 'star_datasets', PULL)
Dataset.register_delete_rule(Statistics, 'dataset', CASCADE)
Dataset.register_delete_rule(Job, 'dataset', CASCADE)

# App.register_delete_rule(User, 'used_apps', PULL)  # TODO 把相关的used_apps删掉


