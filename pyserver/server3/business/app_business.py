# -*- coding: UTF-8 -*-
import os
import yaml
from copy import deepcopy
from subprocess import call
import synonyms
import docker

from server3.entity import project
from server3.business.project_business import ProjectBusiness
from server3.business.general_business import GeneralBusiness
from server3.repository.general_repo import Repo
from server3.utility.json_utility import args_converter
from server3.constants import APP_DIR
from server3.constants import MODULE_DIR
from server3.constants import DOCKER_IP
from server3.constants import INIT_RES
from server3.constants import Error, Warning, ErrorMessage
from server3.entity.general_entity import Objects

yaml_tail_path = 'app_spec.yml'


class AppBusiness(ProjectBusiness, GeneralBusiness):
    repo = Repo(project.App)
    __cls = project.App
    base_func_path = './functions'

    @classmethod
    def deploy(cls, app_id):
        app = cls.get_by_id(app_id)
        app.status = 'deploying'
        app.save()

        modules = [m.user.user_ID + '/' + m.name for m in app.used_modules]
        if modules is None:
            modules = []

        service_name = app.user.user_ID + '-' + app.name
        # faas new in functions dir
        call(['faas-cli', 'new', service_name, '--lang=python3',
              f'--gateway=http://{DOCKER_IP}:8080'],
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
            print(module_path, module_path_target)
            cls.copytree(module_path, module_path_target)
        print('finish copy')
        # deploy
        call(['faas-cli', 'build', '-f', f'./{service_name}.yml'],
             cwd=cls.base_func_path)
        call(['faas-cli', 'deploy', '-f', f'./{service_name}.yml'],
             cwd=cls.base_func_path)

        user_ID = app.user.user_ID
        dir_path = os.path.join(APP_DIR, user_ID + '-' + app.name)

        app.app_path = dir_path
        app.privacy = 'public'
        app.status = 'active'
        app.save()
        return app

    # @classmethod
    # def get_by_id(cls, project_id, yml=False):
    #     app = ProjectBusiness.get_by_id(project_id)
    #     if yml and app.app_path:
    #         app.args = cls.load_app_params(app)
    #     return app

    @staticmethod
    def load_app_params(app):
        yml_path = os.path.join(app.app_path, yaml_tail_path)
        with open(yml_path, 'r') as stream:
            obj = yaml.load(stream)
            return {'input': obj.get('input'), 'output': obj.get('output')}

    @classmethod
    def add_used_module(cls, app_id, used_modules, func):
        app = cls.get_by_id(app_id)
        app_yaml_path = os.path.join(app.path, yaml_tail_path)
        args = {}
        output = {}
        # copy module yaml to app yaml
        for module in used_modules:
            cls.insert_module_env(app, module)
            # copy yaml
            input_args = module.to_mongo()['args']['input'].get(func, {})
            output_args = module.to_mongo()['args']['output'].get(func, {})
            if os.path.isfile(app_yaml_path):
                with open(app_yaml_path, 'r') as stream:
                    # read args
                    obj = yaml.load(stream)
                    args = cls.replace_dup_n_update(obj['input'], input_args,
                                                    module.name)
                    output = cls.update_with_module_name(obj.get('output', {}),
                                                         output_args,
                                                         module.name)
            else:
                args = cls.update_with_module_name(args, input_args,
                                                   module.name)
                output = cls.update_with_module_name(output, output_args,
                                                     module.name)
            # write new args
            with open(app_yaml_path, 'w') as stream:
                yaml.dump({'input': args, 'output': output}, stream,
                          default_flow_style=False)
        return cls.repo.add_to_set(app_id, used_modules=used_modules)

    @staticmethod
    def insert_module_env(app, module):
        client = docker.from_env()
        # copy venv
        user_ID = module.user.user_ID
        user_ID_c = user_ID.replace('_', '_5F')
        app_name = app.name.replace('_', '_5F')
        container = client.containers. \
            get(f'jupyter-{user_ID_c}_2B{app_name}')
        container.exec_run(['/bin/bash', '/home/jovyan/add_venv.sh',
                            f'{user_ID}/{module.name}'])

    @classmethod
    def replace_dup_n_update(cls, args, func_args, module_name):
        # find duplicate arg name of module_arg and app_arg and
        # replace the name
        args = cls.replace_dup_name(args, func_args, module_name)
        # edit app args
        return cls.update_with_module_name(args, func_args,
                                           module_name)

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

    # @classmethod
    # def create_project(cls, name, description, user, privacy='private',
    #                    tags=None, user_token='', type='app'):
    #     pass

    @classmethod
    def list_projects_chat(cls, search_query, page_no=None, page_size=None,
                           default_max_score=0.4, ):
        start = (page_no - 1) * page_size
        end = page_no * page_size

        all_apps = cls.get_all()
        #  比对打分
        for app in all_apps:
            name_score = synonyms.compare(search_query, app.name, seg=True)
            description_score = synonyms.compare(search_query, app.description,
                                                 seg=True)
            app.score = (name_score + description_score) / 2
        # 筛选掉小于 description_score
        apps = list(
            filter(lambda app: app.score >= default_max_score, all_apps))

        count = len(apps)
        apps = sorted(apps, key=lambda item: -item.score)
        return Objects(
            objects=apps[start:end],
            count=count,
            page_no=page_no,
            page_size=page_size
        )

    @classmethod
    def increment_usage_count(cls, api_id):
        app = cls.get_by_id(api_id)
        app.usage_count += 1
        return app.save()
        # apps_score.count()
        # max_score = apps_score[0].score
        # if max_score < default_max_score:
        #     raise Warning(ErrorMessage.no_match_apis)
        # else:
        #     apps = apps_score
        #     count = apps_score.count()
        #     return {
        #         "objects": apps[start:end],
        #         "count": count,
        #         "page_no": page_no,
        #         "page_size": page_size,
        #     }
        #     # return apps[start:end]
        # @classmethod
        # def run_app(cls, app_id, input_json):
        #     app = AppBusiness.get_by_id(project_id=app_id)
        #     url = app.user.user_ID+"-"+app.name
        #     domin = "192.168.31.23:8080/function/"
        #     url = domin+url
        #     payload = input_json
        #     headers = {
        #         'content-type': "application/json",
        #     }
        #     response = requests.request("POST", url, data=payload, headers=headers)
        #     return response.json()


if __name__ == "__main__":
    # apps = project.App.objects(user=)
    pass
