# -*- coding: UTF-8 -*-
import os
import re
import yaml
import time
import shutil
import fileinput
import tempfile
import tarfile

from copy import deepcopy
from subprocess import call
from io import BytesIO
from datetime import datetime
from datetime import timedelta

import synonyms
import docker

from server3.entity import project
from server3.entity.project import Deployment
from server3.business.project_business import ProjectBusiness
from server3.business.general_business import GeneralBusiness
from server3.repository.app_repo import AppRepo
from server3.repository.general_repo import Repo
from server3.utility.json_utility import args_converter
from server3.constants import APP_DIR
from server3.constants import MODULE_DIR
from server3.constants import DOCKER_IP
from server3.constants import APP_DIR
from server3.constants import DEFAULT_DEPLOY_VERSION
from server3.constants import INIT_RES
from server3.constants import Error, Warning, ErrorMessage
from server3.entity.general_entity import Objects
from server3.entity.project import UsedModule
from server3.entity.project import UsedDataset

yaml_tail_path = 'app_spec.yml'


class AppBusiness(ProjectBusiness, GeneralBusiness):
    repo = AppRepo(project.App)
    entity = project.App
    base_func_path = APP_DIR

    @classmethod
    def create_project(cls, *args, **kwargs):
        ProjectBusiness.repo = Repo(project.App)
        return ProjectBusiness.create_project(*args, status='inactive',
                                              **kwargs)

    @staticmethod
    def get_service_name(app, version):
        return '-'.join([app.user.user_ID, app.name, version])

    @classmethod
    def get_service_logs(cls, app, version, since=1):
        client = docker.APIClient()
        service_name = cls.get_service_name(app, version)
        service = client.services(filters={'name': service_name})[0]
        from_time = datetime.now() - timedelta(minutes=since)
        logs = client.service_logs(service['ID'], stdout=True, stderr=True,
                                   since=int(time.mktime(from_time.timetuple())))
        logs = list(logs)
        return logs


    @classmethod
    def deploy_or_publish(cls, app_id, commit_msg, handler_file_path,
                          version=DEFAULT_DEPLOY_VERSION):
        app = cls.get_by_id(app_id)
        app.status = 'deploying'
        app.save()

        container = cls.get_container(app)
        # freeze working env
        # FIXME too slow to install env
        container.exec_run(['/bin/bash', '/home/jovyan/freeze_venv.sh'])
        cls.commit(app_id, commit_msg, version)

        service_name = '-'.join([app.user.user_ID, app.name, version])
        service_name_no_v = '-'.join([app.user.user_ID, app.name])
        # faas new in functions dir
        call(['faas-cli', 'new', service_name, '--lang=python3',
              f'--gateway=http://{DOCKER_IP}:8080'],
             cwd=cls.base_func_path)
        # target path = new path
        func_path = os.path.join(cls.base_func_path, service_name)

        cls.copytree_wrapper(app.path, func_path,
                             ignore=shutil.ignore_patterns('.git'))

        # rename py to handler.py
        handler_file_path = handler_file_path.replace('work', func_path)
        handler_file_path = os.path.join(func_path, handler_file_path)
        handler_file_name = handler_file_path.split('/')[-1]
        handler_dst_path = handler_file_path.replace(handler_file_name,
                                                     'handler.py')

        shutil.copy(handler_file_path, handler_dst_path)

        # change some configurable variable to deploy required
        cls.modify_handler_py(handler_dst_path)

        # 1. copy modules from docker
        cls.copy_from_container(container, '/home/jovyan/modules', func_path)
        # copy path edited __init__.py
        shutil.copy('./functions/template/python3/function/modules/__init__.py',
                    os.path.join(func_path, 'modules'))
        # 2. copy datasets from docker
        cls.copy_from_container(container, '/home/jovyan/dataset', func_path)

        # deploy
        call(['faas-cli', 'build', '-f', f'./{service_name}.yml'],
             cwd=cls.base_func_path)
        call(['faas-cli', 'deploy', '-f', f'./{service_name}.yml'],
             cwd=cls.base_func_path)

        # when not dev(publish), change the privacy etc
        if version != DEFAULT_DEPLOY_VERSION:
            app.privacy = 'public'
            app.versions.append(version)

        app.app_path = os.path.join(cls.base_func_path, service_name_no_v)
        app.status = 'active'
        app.save()
        return app

    # @staticmethod
    # def copy_from_container(container, path_from, path_to):
    #     strm, stat = container.get_archive(path_from)
    #     with tarfile.open(mode='r', fileobj=BytesIO(strm.read())) as t:
    #         t.extractall(path_to)

    @staticmethod
    def copy_from_container(container, path_from, path_to):
        with tempfile.NamedTemporaryFile() as destination:
            strm, stat = container.get_archive(path_from)
            for d in strm:
                destination.write(d)
            destination.seek(0)
            with tarfile.open(mode='r', fileobj=destination) as t:
                t.extractall(path_to)

    @staticmethod
    def modify_handler_py(py_path):
        for line in fileinput.input(files=py_path, inplace=1):
            line = re.sub(r"""work_path = ''""",
                          r"""work_path = 'function/'""",
                          line.rstrip())
            print(line)

    @staticmethod
    def load_app_params(app, version=DEFAULT_DEPLOY_VERSION):
        if not version:
            if len(app.versions) > 0:
                version = app.versions[-1]
            else:
                version = DEFAULT_DEPLOY_VERSION
        yml_path = os.path.join('-'.join([app.app_path, version]),
                                yaml_tail_path)
        if os.path.exists(yml_path):
            with open(yml_path.replace('\\', '/'), 'r') as stream:
                obj = yaml.load(stream)
                return {'input': obj.get('input'), 'output': obj.get('output')}
        else:
            return {'input': {}, 'output': {}}

    @classmethod
    def add_imported_modules(cls, app_id, app_deploy_version, used_modules):
        """

        :param app_id:
        :param modules_with_verison: tuple (module_object
        :param app_deploy_version:
        :return:
        """
        cls.repo.add_imported_modules(app_id, app_deploy_version, used_modules)

    # TODO: Finish the function
    @classmethod
    def add_imported_datasets(cls, app_id, app_deploy_version, used_datasets):
        pass

    @classmethod
    def add_used_module(cls, app_id, module, func, version):
        app = cls.get_by_id(app_id)
        app_yaml_path = os.path.join(app.path, yaml_tail_path)
        args = {}
        output = {}
        cls.insert_module_env(app, module, version)
        # copy module yaml to app yaml
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
        return cls.repo.add_to_set(app_id, used_modules=UsedModule(
            module=module, version=version))

    @staticmethod
    def copy_to_container(container, path_from, path_to):
        container.exec_run(['mkdir', '-p', f'{path_to}'])
        with docker.utils.tar(path_from) as module_tar:
            container.put_archive(path_to, module_tar)
        container.exec_run(['chown', '-R', 'jovyan:users', f'{path_to}'],
                           user='root', privileged=True)

    @classmethod
    def get_container(cls, app):
        client = docker.from_env()
        app_user_ID = app.user.user_ID.replace('_', '_5F')
        app_name = app.name.replace('_', '_5F')
        container_name = f'jupyter-{app_user_ID}_2B{app_name}'
        container = client.containers.get(container_name)
        return container

    @classmethod
    def insert_module_env(cls, app, module, version):
        module_user_ID = module.user.user_ID
        container = cls.get_container(app)
        # copy module folder to container
        path_w_version = os.path.join(module.module_path, version)
        path_in_ctnr = path_w_version.replace('./server3/lib/modules',
                                              '/home/jovyan/modules')

        # do the copy, dir need be created first, and put_archive need
        # ownership fix
        cls.copy_to_container(container, path_w_version, path_in_ctnr)

        # copy python env
        container.exec_run(['/bin/bash', '/home/jovyan/add_venv.sh',
                            f'{module_user_ID}/{module.name}/{version}'])

    @classmethod
    def remove_used_module(cls, app_id, module, version):
        app = cls.get_by_id(app_id)
        cls.remove_module_env(app, module, version)
        return cls.repo.pull_from_set(app_id, used_modules=UsedModule(
            module=module, version=version))

    @classmethod
    def remove_module_env(cls, app, module, version):
        module_user_ID = module.user.user_ID
        container = cls.get_container(app)
        # copy module folder to container
        path_w_version = os.path.join(module.module_path, version)
        path_in_ctnr = path_w_version.replace('./server3/lib/modules',
                                              '/home/jovyan/modules')
        if len(path_in_ctnr.split('/')) == 7:
            container.exec_run(['rm', '-rf', f'{path_in_ctnr}'])
        else:
            raise Exception('module path error')

        # remove python env
        container.exec_run(['/bin/bash', '/home/jovyan/remove_venv.sh',
                            f'{module_user_ID}/{module.name}/{version}'])

    @classmethod
    def insert_dataset(cls, app, dataset):
        container = cls.get_container(app)

        # copy dataset folder to container
        path_in_ctnr = dataset.path.replace('./user_directory',
                                            '/home/jovyan/dataset')
        # do the copy, dir need be created first, and put_archive need
        # ownership fix
        cls.copy_to_container(container, dataset.path, path_in_ctnr)
        return cls.repo.add_to_set(app.id, used_datasets=UsedDataset(
            dataset=dataset))

    @classmethod
    def remove_used_dataset(cls, app_id, dataset):
        app = cls.get_by_id(app_id)
        cls.remove_dataset_dir(app, dataset)
        return cls.repo.pull_from_set(app_id, used_datasets=UsedDataset(
            dataset=dataset))

    @classmethod
    def remove_dataset_dir(cls, app, dataset):
        container = cls.get_container(app)

        # copy dataset folder to container
        path_in_ctnr = dataset.path.replace('./user_directory',
                                            '/home/jovyan/dataset')
        print(path_in_ctnr)
        if len(path_in_ctnr.split('/')) == 6:
            container.exec_run(['rm', '-rf', f'{path_in_ctnr}'])
        else:
            raise Exception('dataset path error')

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
                           default_max_score=0.4, privacy="public"):
        start = (page_no - 1) * page_size
        end = page_no * page_size

        # all_apps = cls.get_all()
        all_apps = cls.repo.read(query={"privacy": privacy})
        # all_apps = cls.read(query={"privacy": privacy})

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

    @classmethod
    def get_action_entity(cls, app_obj, page_no, page_size, action_entity):
        start = (page_no - 1) * page_size
        end = page_no * page_size
        objects = getattr(app_obj, action_entity)
        objects.reverse()
        return Objects(
            objects=objects[start:end],
            count=len(objects),
            page_no=page_no,
            page_size=page_size)


if __name__ == "__main__":
    pass
