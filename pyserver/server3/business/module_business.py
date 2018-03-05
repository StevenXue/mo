import os
import yaml
import shutil
from importlib import import_module
from datetime import datetime

from server3.entity.module import Module
from server3.entity import project
from server3.repository.general_repo import Repo
from server3.business.project_business import ProjectBusiness
from server3.constants import MODULE_DIR
module_repo = Repo(Module)

tail_path = 'src/module_spec.yml'


def add(name, user, **kwargs):
    try:
        module_path = kwargs.pop("module_path")
    except KeyError:
        module_path = "/" + user.user_ID + "/" + name

    create_time = datetime.utcnow()
    model = Module(
        user=user, name=name,
        module_path=module_path,
        create_time=create_time, **kwargs)
    return module_repo.create(model)


def get_all():
    model_list = module_repo.read({})
    return model_list


def update_by_id(module_id, **update):
    return module_repo.update_one_by_id(module_id, update)


class ModuleBusiness(ProjectBusiness):
    repo = Repo(project.Module)

    @classmethod
    def create_project(cls, name, description, user, privacy='private',
                       tags=None, user_token='', type='app', category='model'):
        """
        Create a new project

        :param name: str
        :param description: str
        :param user_ID: ObjectId
        :param is_private: boolean
        :param type: string (app/module/dataset)
        :param tags: list of string
        :param user_token: string
        :return: a new created project object
        """
        if tags is None:
            tags = []
        user_ID = user.user_ID

        # generate project dir
        project_path = cls.gen_dir(user_ID, name)

        # auth jupyterhub with user token
        res = cls.auth_hub_user(user_ID, name, user_token)

        # create a new project object
        create_time = datetime.utcnow()
        return cls.repo.create_one(name=name, description=description,
                                   create_time=create_time,
                                   update_time=create_time,
                                   type=type, tags=tags,
                                   hub_token=res.get('token'),
                                   path=project_path, user=user,
                                   privacy=privacy, category=category)

    @classmethod
    def get_by_id(cls, project_id, yml=False):
        module = ProjectBusiness.get_by_id(project_id)
        # TODO 完全加入这个参数后去掉
        if module.module_path is None:
            user_ID = module.user.user_ID
            dir_path = os.path.join(MODULE_DIR, user_ID, module.name)
            module.module_path = dir_path
            module.save()
        if yml and module.module_path:
            module.input, module.output = cls.load_module_params(module)
        return module

    @staticmethod
    def load_module_params(module):
        yml_path = os.path.join(module.module_path, tail_path)
        with open(yml_path, 'r') as stream:
            obj = yaml.load(stream)
            return obj.get('input'), obj.get('output')

    @classmethod
    def publish(cls, project_id):
        module = cls.get_by_id(project_id, yml=False)
        module.module_path = os.path.join(MODULE_DIR, module.user.user_ID,
                                          module.name)
        module.save()
        dst = module.module_path
        # if dir exists, remove it and copytree, cause copytree will
        #  create the dir
        if os.path.exists(dst):
            shutil.rmtree(dst)
        shutil.copytree(module.path, dst)
