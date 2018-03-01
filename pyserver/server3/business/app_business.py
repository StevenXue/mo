# -*- coding: UTF-8 -*-
import os
import yaml
import re
import fileinput
from subprocess import call

from server3.entity import project
from server3.business.project_business import ProjectBusiness
from server3.repository.general_repo import Repo
from server3.utility.json_utility import args_converter
from server3.constants import MODULE_DIR

yaml_tail_path = 'app_spec.yml'

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

        service_name = app.user.user_ID + '-' + app.name
        # faas new in functions dir
        call(['faas-cli', 'new', service_name, '--lang=python3'],
             cwd=cls.base_func_path)
        # target path = new path
        func_path = os.path.join(cls.base_func_path, service_name)
        module_dir_path = os.path.join(func_path, 'modules')
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
        call(['faas-cli', 'build', '-f', './{name}.yml'.format(
            name=service_name)],
             cwd=cls.base_func_path)
        call(
            ['faas-cli', 'deploy', '-f', './{name}.yml'.format(
                name=service_name)],
            cwd=cls.base_func_path)
        return service_name

    @classmethod
    def add_used_module(cls, app_id, used_modules, func):
        app = cls.get_by_id(app_id)
        app_yaml_path = os.path.join(app.path, yaml_tail_path)
        args = {}
        # copy module yaml to app yaml
        for module in used_modules:
            func_args = module.args[func]
            if os.path.isfile(app_yaml_path):
                with open(app_yaml_path, 'r') as stream:
                    # read args
                    args = yaml.load(stream)
                    # find duplicate arg name of module_arg and app_arg and
                    # replace the name
                    args = cls.replace_dup_name(args, func_args, module.name)
                    # edit app args
                    args = cls.update_with_module_name(args, func_args,
                                                       module.name)
            else:
                args = cls.update_with_module_name(args, func_args,
                                                   module.name)
            # write new args
            with open(app_yaml_path, 'w') as stream:
                yaml.dump(dict(args), stream, default_flow_style=False)
        return cls.repo.add_to_set(app_id, used_modules=used_modules)

    @staticmethod
    def replace_dup_name(args, func_args, module_name):
        conv_args = args_converter(args)
        for k, v in func_args.items():
            name = v['name']
            if v['name'] in conv_args:
                key = conv_args[name]['key']
                args[key]['name'] = module_name + '_' + args[key]['name']
        return args

    @staticmethod
    def update_with_module_name(app_args, func_args, module_name):
        for k, v in func_args.items():
            app_args[module_name + '_' + k] = v
        return app_args

    @classmethod
    def nb_to_script(cls, app_id, nb_path):
        app = cls.get_by_id(app_id)
        call(['jupyter', 'nbconvert', '--to', 'script', nb_path],
             cwd=app.path)
        full_path = os.path.join(app.path, nb_path)
        script_path = full_path.replace('ipynb', 'py')
        for line in fileinput.input(files=script_path, inplace=1):
            line = re.sub(
                r"# Please use current \(work\) folder to store your data "
                r"and models",
                r'', line.rstrip())
            line = re.sub(r"sys.path.append\('\.\./'\)", r'', line.rstrip())
            line = re.sub(r"""client = Client\('(.+)'\)""",
                          r"""client = Client('\1', silent=True)""",
                          line.rstrip())
            line = re.sub(r"""from modules import (.+)""",
                          r"""from function.modules import \1""",
                          line.rstrip())
            # add handle function
            line = re.sub(
                r"predict = client\.predict",
                r"\n\ndef handle(conf):\n"
                r"\t# paste your code here\n"
                r"\tprint(result)\n",
                line.rstrip())
            # remove input tag comments
            line = re.sub(
                r"# In\[(\d+)\]:",
                r"", line.rstrip())
            print(line)
