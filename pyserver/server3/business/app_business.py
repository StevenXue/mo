# -*- coding: UTF-8 -*-
import os
import shutil
from subprocess import call

from server3.entity import project
from server3.business.project_business import ProjectBusiness
from server3.repository.general_repo import Repo
from server3.constants import MODULE_DIR


class AppBusiness(ProjectBusiness):
    repo = Repo(project.App)
    base_func_path = './functions'

    @classmethod
    def deploy(cls, app_id):
        app = cls.get_by_id(app_id)
        modules = [m.user.user_ID + '/' + m.name for m in app.used_modules]
        if modules is None:
            modules = ['zhaofengli/flight_delay_prediction',
                       'zhaofengli/weather_prediction']

        # faas new in functions dir
        call(['faas-cli', 'new', app.name, '--lang=python3'],
             cwd=cls.base_func_path)
        # target path = new path
        func_path = os.path.join(cls.base_func_path, app.name)
        module_dir_path = os.path.join(func_path, 'modules')
        # copy tree
        cls.copytree(app.path, func_path)
        # copy modules
        for module in modules:
            owner_ID = module.split('/')[0]
            module_path = os.path.join(MODULE_DIR, module)
            module_path_target = os.path.join(module_dir_path, module)
            try:
                os.makedirs(os.path.join(module_dir_path, owner_ID))
            except FileExistsError:
                print('dir exists, no need to create')
            # copy module tree to target path
            cls.copytree(module_path, module_path_target)
        # deploy
        call(['faas-cli', 'build', '-f', './{name}.yml'.format(name=app.name)],
             cwd=cls.base_func_path)
        call(
            ['faas-cli', 'deploy', '-f', './{name}.yml'.format(name=app.name)],
            cwd=cls.base_func_path)

    @classmethod
    def add_used_module(cls, app_id, used_modules):
        return cls.repo.add_to_set(app_id, used_modules=used_modules)
