import os
import uuid
import yaml
import shutil
import subprocess
from distutils.core import setup
from importlib import import_module
from datetime import datetime
from distutils.dir_util import copy_tree
from distutils.dir_util import remove_tree

import docker
from git import Repo as GRepo
from cookiecutter.main import cookiecutter
from Cython.Build import cythonize

# from server3.entity.module import Module
from server3.entity import project
from server3.repository.general_repo import Repo
from server3.business.project_business import ProjectBusiness
from server3.service.validation.validation import GDValidation
from server3.constants import MODULE_DIR
from server3.constants import DEV_DIR_NAME
from server3.constants import USER_DIR
from server3.constants import GIT_SERVER_IP

# module_repo = Repo(Module)

tail_path = 'src/module_spec.yml'
cat_dict = {
    'model':
        'https://github.com/momodel/cookiecutter-python-model.git',
    'toolkit':
        'https://github.com/momodel/cookiecutter-python-toolkit.git'
}
TOOL_REPO = 'https://github.com/momodel/dev_cmd_tools.git'


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

        # user_path = os.path.join(USER_DIR, user_ID)
        # project_path = os.path.join(USER_DIR, user_ID, name)

        # generate project dir
        project_path = cls.gen_dir(user_ID, name)
        temp_path = cls.gen_dir(user_ID, uuid.uuid4().hex)
        # temp_tool_path = cls.gen_dir(user_ID+'_tool', uuid.uuid4().hex)

        # init git repo
        cls.init_git_repo(user_ID, name)

        # clone to project dir
        repo = cls.clone(user_ID, name, project_path)

        # create template to temp path
        cookiecutter(
            cat_dict[category],
            no_input=True, output_dir=temp_path,
            extra_context={
                "author_name": user_ID,
                "module_name": name,
                "module_type": category,
                "module_description": description,
            })

        # copy temp project to project dir and remove temp dir
        # need to keep .git, cannot use cls.copytree_wrapper
        copy_tree(os.path.join(temp_path, name), project_path)
        remove_tree(temp_path)

        # tools_path = os.path.join(project_path, 'dev_cmd_tools')
        # os.makedirs(tools_path)
        # copy_tree(temp_tool_path, tools_path)

        # cookiecutter(
        #     TOOL_REPO,
        #     no_input=True, output_dir=project_path,
        #     extra_context={
        #         "author_name": user_ID,
        #         "module_name": name,
        #         "module_type": category,
        #         "module_description": description,
        #     })

        # add all
        repo.git.add(A=True)
        # initial commit
        repo.index.commit('Initial Commit')
        repo.remote(name='origin').push()
        commit = cls.update_project_commits(repo)
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
            privacy=privacy, category=category, commits=[commit],
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
    def load_module_params(module, version=''):
        # TODO remove 'try except' after modules all have versions
        try:
            if not version:
                version = module.versions[-1]
        except:
            version = ''
        yml_path = os.path.join(module.module_path, version, tail_path)
        with open(yml_path, 'r') as stream:
            obj = yaml.load(stream)
            return {'input': obj.get('input'), 'output': obj.get('output')}

    @classmethod
    def deploy_or_publish(cls, project_id, commit_msg, version='dev'):
        module = cls.get_by_id(project_id)

        # commit module
        cls.commit(project_id, commit_msg, version)

        module.module_path = os.path.join(MODULE_DIR, module.user.user_ID,
                                          module.name)
        dst = os.path.join(module.module_path, version)

        # copy module
        cls.copytree_wrapper(module.path, dst,
                             ignore=shutil.ignore_patterns('.git'))
        # install module env
        subprocess.call(['bash', 'install_venv.sh', os.path.abspath(dst)])

        bind_path = '/home/jovyan/modules'

        # copy compile related files to module src
        shutil.copy('./setup.py',
                    os.path.join(module.module_path, version, 'src'))
        shutil.copy('./compile.sh',
                    os.path.join(module.module_path, version, 'src'))

        compile_dir = module.module_path.replace('./server3/lib/modules',
                                                 bind_path)
        compile_dir = os.path.join(compile_dir, version, 'src')

        # start container with the singleuser docker, mount the whole pyserver
        # compile the main.py and delete compile related files
        client = docker.from_env()
        client.containers.run(
            "singleuser:latest",
            volumes={os.path.abspath(MODULE_DIR):
                         {'bind': bind_path, 'mode': 'rw'}},
            command=f"/bin/bash -c 'cd {compile_dir} && bash ./compile.sh'")

        # if publish update privacy and version
        if version != 'dev':
            module.privacy = 'public'
            module.versions.append(version)
            module.save()

        return module

    @classmethod
    def run_test(cls, project_id):
        project = cls.get_by_id(project_id)
        result = GDValidation.run_test(project.path, project.name,
                                       project.user.user_ID, project.category)
        failures = [f[1] for f in result.failures]
        return failures
