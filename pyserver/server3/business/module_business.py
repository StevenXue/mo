import os
import yaml
import shutil
import subprocess
from importlib import import_module
from datetime import datetime
from git import Repo as GRepo
from cookiecutter.main import cookiecutter

from distutils.dir_util import copy_tree
# from server3.entity.module import Module
from server3.entity import project
from server3.repository.general_repo import Repo
from server3.business.project_business import ProjectBusiness
from server3.constants import MODULE_DIR
from server3.constants import USER_DIR
from server3.constants import GIT_SERVER_IP

# module_repo = Repo(Module)

tail_path = 'src/module_spec.yml'


# def add(name, user, **kwargs):
#     try:
#         module_path = kwargs.pop("module_path")
#     except KeyError:
#         module_path = "/" + user.user_ID + "/" + name
#
#     create_time = datetime.utcnow()
#     model = Module(
#         user=user, name=name,
#         module_path=module_path,
#         create_time=create_time, **kwargs)
#     return module_repo.create(model)
#
#
# def get_all():
#     model_list = module_repo.read({})
#     return model_list
#
#
# def update_by_id(module_id, **update):
#     return module_repo.update_one_by_id(module_id, update)


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

        user_path = os.path.join(USER_DIR, user_ID)
        # project_path = os.path.join(USER_DIR, user_ID, name)

        # generate project dir
        project_path = cls.gen_dir(user_ID, name)

        # init git repo
        cls.init_git_repo(user_ID, name)

        # clone to project dir
        repo = cls.clone(user_ID, name, project_path)

        # create template
        # TODO real template and new template method
        # copy_tree(
        #     '/Users/zhaofengli/projects/goldersgreen/pyserver/module_template',
        #     project_path)

        cookiecutter(
            'https://github.com/Acrobaticat/mo-cookiecutter-python.git',
            no_input=True, output_dir=user_path,
            extra_context={
                "author_name": user_ID,
                "module_name": name,
                "module_type": category,
                "module_description": description,
                "repository": ""
            })
        # add all
        repo.git.add(A=True)
        # initial commit
        repo.index.commit('Initial Commit')
        repo.remote(name='origin').push()

        # auth jupyterhub with user token
        res = cls.auth_hub_user(user_ID, name, user_token)

        # create a new project object
        create_time = datetime.utcnow()
        return cls.repo.create_one(
            name=name, description=description,
            create_time=create_time,
            update_time=create_time,
            type=type, tags=tags,
            hub_token=res.get('token'),
            path=project_path, user=user,
            privacy=privacy, category=category,
            repo_path=f'http://{GIT_SERVER_IP}/repos/{user_ID}/{name}')

    # @classmethod
    # def get_by_id(cls, project_id, yml=False):
    #     module = ProjectBusiness.get_by_id(project_id)
    #     # TODO 完全加入这个参数后去掉
    #     if module.module_path is None:
    #         user_ID = module.user.user_ID
    #         dir_path = os.path.join(MODULE_DIR, user_ID, module.name)
    #         module.module_path = dir_path
    #         module.save()
    #     if yml and module.module_path:
    #         module.input, module.output = cls.load_module_params(module)
    #     return module

    @staticmethod
    def load_module_params(module):
        yml_path = os.path.join(module.module_path, tail_path)
        with open(yml_path, 'r') as stream:
            obj = yaml.load(stream)
            return {'input': obj.get('input'), 'output': obj.get('output')}

    @classmethod
    def publish(cls, project_id):
        module = cls.get_by_id(project_id)
        module.module_path = os.path.join(MODULE_DIR, module.user.user_ID,
                                          module.name)
        module.privacy = 'public'
        module.save()

        dst = module.module_path
        # if dir exists, remove it and copytree, cause copytree will
        #  create the dir
        if os.path.exists(dst):
            shutil.rmtree(dst)
        shutil.copytree(module.path, dst)
        # WORKON_HOME=./ pipenv install vv
        subprocess.call(['bash', 'install_venv.sh', os.path.abspath(dst)])

        return module
