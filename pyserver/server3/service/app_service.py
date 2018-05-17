# -*- coding: UTF-8 -*-
import os
import requests
import json
import re
import shutil

from bson import ObjectId
from subprocess import call

from server3.service.project_service import ProjectService
from server3.business.module_business import ModuleBusiness
from server3.business.data_set_business import DatasetBusiness
from server3.business.app_business import AppBusiness
from server3.business.user_business import UserBusiness
from server3.business import user_business
from server3.business.statistics_business import StatisticsBusiness
from server3.service import message_service
from server3.constants import DOCKER_IP
from server3.constants import DEFAULT_DEPLOY_VERSION


class AppService(ProjectService):
    business = AppBusiness

    @classmethod
    def add_used_module(cls, app_id, used_module, func, version):
        used_module = ModuleBusiness.get_by_id(used_module)
        used_module.args = ModuleBusiness.load_module_params(
            used_module, version)
        return cls.business.add_used_module(app_id, used_module, func, version)

    # @classmethod
    # def add_imported_modules(cls, app_id, imported_module, deploy_version):
    #     """
    #     Add imported modules and datasets into app.deployment
    #     while user deploy an app.
    #
    #     :param app_id: app id
    #     :param imported_module: tuple (user_name, project_name, version)
    #     :param version:
    #     :return:
    #     """
    #     app = cls.get_by_id(app_id)
    #     AppBusiness.add_imported_module()
    #     pass

    @classmethod
    def remove_used_module(cls, app_id, used_module, version):
        used_module = ModuleBusiness.get_by_id(used_module)
        return cls.business.remove_used_module(app_id, used_module, version)

    @classmethod
    def add_used_dataset(cls, app_id, used_dataset):
        used_dataset = DatasetBusiness.get_by_id(used_dataset)
        app = cls.business.get_by_id(app_id)
        return cls.business.insert_dataset(app, used_dataset)

    @classmethod
    def remove_used_dataset(cls, app_id, used_dataset):
        used_dataset = DatasetBusiness.get_by_id(used_dataset)
        return cls.business.remove_used_dataset(app_id, used_dataset)

    @classmethod
    def run_app(cls, app_id, input_json, user_ID, version):
        """

        :param app_id: app id
        :param input_json:
        :param user_ID:
        :param version:
        :return:
        :rtype:
        """
        app = AppBusiness.get_by_id(project_id=app_id)
        url = '-'.join([app.user.user_ID, app.name, version])
        domin = f"http://{DOCKER_IP}:8080/function/"
        url = domin + url
        payload = json.dumps(input_json)
        headers = {
            'content-type': "application/json",
        }
        response = requests.request("POST", url, data=payload, headers=headers)
        pattern = re.compile(r'STRHEAD(.+?)STREND', flags=re.DOTALL)
        results = pattern.findall(response.text)
        print(results)
        try:
            output_json = json.loads(results[0])
        except IndexError as e:
            try:
                errors = cls.business.get_service_logs(app, version)
            except IndexError as e:
                output_json = {
                    'errors': ['Service is down please deploy again!']
                }
            else:
                output_json = {
                    'errors': errors
                }
        # output_json = response.json()
        # 成功调用后 在新的collection存一笔
        user_obj = UserBusiness.get_by_user_ID(user_ID=user_ID)
        # 筛选 input_json

        StatisticsBusiness.use_app(
            user_obj=user_obj, app_obj=app,
            output_json=output_json
            # input_json=input_json,
            # output_json=output_json
        )
        return output_json

    @classmethod
    def insert_envs(cls, user_ID, app_name):
        """
        copy used modules and datasets to jl container when start
        :param user_ID:
        :param app_name:
        :return:
        """
        user = UserBusiness.get_by_user_ID(user_ID)
        app = AppBusiness.read_unique_one(name=app_name, user=user)
        for used_module in app.used_modules:
            AppBusiness.insert_module_env(app, used_module.module,
                                          used_module.version)
        for used_dataset in app.used_datasets:
            AppBusiness.insert_dataset(app, used_dataset.dataset)

    @classmethod
    def get_by_id(cls, project_id, **kwargs):
        project = super().get_by_id(project_id, **kwargs)
        print(kwargs, project.app_path)
        if kwargs.get('yml') == 'true' and project.app_path:
            project.args = cls.business.load_app_params(project,
                                                        kwargs.get('version'))
        # if kwargs.get('used_modules') == 'true':
        #     project.used_modules = [{'module': m.module.to_mongo(),
        #                              'version': m.version}
        #                             for m in project.used_modules]

        project.versions = \
            ['.'.join(version.split('_')) for version in
             project.versions]
        return project

    @classmethod
    def publish(cls, project_id, commit_msg, handler_file_path, version):
        try:
            app = cls.business.deploy_or_publish(project_id, commit_msg,
                                                    handler_file_path, version)
            cls.send_message(app, m_type='publish')
        except:
            app = cls.business.get_by_id(project_id)
            app.status = 'inactive'
            app.save()
            cls.send_message(app, m_type='publish_fail')
        else:
            return app

    @classmethod
    def deploy(cls, project_id, commit_msg, handler_file_path):
        try:
            app = cls.business.deploy_or_publish(project_id, commit_msg,
                                                    handler_file_path)
            cls.send_message(app, m_type='deploy')
        except:
            app = cls.business.get_by_id(project_id)
            app.status = 'inactive'
            app.save()
            cls.send_message(app, m_type='deploy_fail')
        return app

    @classmethod
    def get_action_entity(cls, app_id, **kwargs):
        app = AppBusiness.get_by_id(app_id)
        return AppBusiness.get_action_entity(app, **kwargs)

    # FIXME: Deprecated
    @classmethod
    def find_imported_modules(cls, script):
        """
        Scan python script to get imported modules.

        :param script: python script
        :return: list of imported modules in
                 (user_id, module_name, version) tuple format.
        """
        pattern = r"""^(?!#).*(run|predict|train)\s*\(('|")(([\w\d_-]+)/([\w\d_-]+)/(\d+\.\d+\.\d+))('|")"""

        modules = []
        for match in re.finditer(pattern, script, re.MULTILINE):
            if '#' not in match.group(0):
                modules.append((match.group(4), match.group(5), match.group(6)))

        return modules

    @classmethod
    def app_deploy_or_publish(cls, app_id, commit_msg, handler_file_path,
                              version=DEFAULT_DEPLOY_VERSION):
        """

        App project go deploy or publish.

        :param app_id: app project id
        :param commit_msg: commit msg
        :param handler_file_path: work/XXXX.py file, source
        :param version: app project go production version
        :return: app object
        """

        # update app status to 'deploying
        app = cls.get_by_id(app_id)
        app.status = 'deploying'
        app.save()

        container = cls.business.get_container(app)
        # freeze working env
        # FIXME too slow to install env
        container.exec_run(['/bin/bash', '/home/jovyan/freeze_venv.sh'])
        cls.business.commit(app_id, commit_msg, version)

        service_name = '-'.join([app.user.user_ID, app.name, version])
        service_name_no_v = '-'.join([app.user.user_ID, app.name])

        # faas new in functions dir
        call(['faas-cli', 'new', service_name, '--lang=python3',
              f'--gateway=http://{DOCKER_IP}:8080'],
             cwd=cls.business.base_func_path)

        # target path = new path
        func_path = os.path.join(cls.business.base_func_path, service_name)

        cls.business.copytree_wrapper(app.path, func_path,
                             ignore=shutil.ignore_patterns('.git'))

        # rename py to handler.py
        handler_file_path = handler_file_path.replace('work', func_path)
        handler_file_path = os.path.join(func_path, handler_file_path)
        handler_file_name = handler_file_path.split('/')[-1]
        handler_dst_path = handler_file_path.replace(handler_file_name, 'handler.py')

        shutil.copy(handler_file_path, handler_dst_path)

        # change some configurable variable to deploy required
        cls.business.modify_handler_py(handler_dst_path)

        with open(handler_file_path, 'r') as f:

            script = f.read()

            # 1. get possible imported dataset list from
            # app.used_datasets[n].dataset.path
            # e.g. './user_directory/zhaofengli/anone
            possible_used_datasets = \
                [(d.dataset, d.dataset.path.replace(
                    './user_directory', 'dataset'))
                 for d in app.used_datasets]

            # 2. get possible imported module list from
            # app.used_modules in list of
            # tuple (module_object, module_version) format
            possible_used_modules = \
                [(m.module, m.version) for m in app.used_modules]


            # 3. check if there is any matches in script
            for d in possible_used_datasets:
                pattern = r"""^(?!#).*({})""".format(d[1])
                matches = re.findall(pattern, script, re.MULTILINE)

                if len(matches) > 0:
                    for ma in matches:
                        if '#' in ma.group(0):
                            possible_used_datasets.remove(d)
                else:
                    possible_used_datasets.remove(d)

            for m in possible_used_modules:
                pattern = \
                    r"""^(?!#).*(run|predict|train)\s*\(('|")({}/{}/{})('|")"""\
                    .format(m[0].user.user_ID,
                            m[0].name,
                            m[1].replace('_', '.'))
                matches = re.findall(pattern, script, re.MULTILINE)
                if len(matches) > 0:
                    for ma in matches:
                        if '#' in ma.group(0):
                            possible_used_modules.remove(m)
                else:
                    possible_used_modules.remove(m)

            # 4. save verified possible_imported_modules/datasets
            # to app.deployments
            cls.business.add_imported_modules(
                app_id, version, [m[0] for m in possible_used_modules])

            cls.business.add_imported_datasets(
                app_id, version, [d[0] for d in possible_used_datasets])


            # Move module from project.module_path
            # ./server3/lib/modules/zhaofengli/newttt/[module_version]/ to
            # ./fucntion/[user_ID]-[app_name]-[app_version]/modules/
            # [user_ID]/[module_name]/[module_version]
            for m in possible_used_modules:
                shutil.copytree('{}/{}/'.format(m[0].module_path,
                                                m[1].replace('.', '_')),
                                './function/{}-{}-{}/modules/{}/{}/{}/'.format(
                                    app.user.user_ID, app.name, version,
                                    m[0].user.name, m[0].name,
                                    m[1].replace('.', '_')))

            # Move dataset from 引用者的DOCKER CONTAINER 里面的
            # ~/dataset/[user_ID] to
            # ./fucntion/[user_ID]-[app_name]-[app_version]/
            # dataset/[user_ID]/[dataset_name]/

            for d in possible_used_datasets:
                cls.business.copy_from_container(
                    container,
                    '/home/jovyan/{}'.format(d[1]),
                    './function/{}-{}-{}/modules/{}/{}'.format(
                        app.user.user_ID, app.name, version,
                        d[0].use.name, d[0].name))

        # copy path edited __init__.py
        shutil.copy('./functions/template/python3/function/modules/__init__.py',
                    os.path.join(func_path, 'modules'))

        # deploy
        call(['faas-cli', 'build', '-f', f'./{service_name}.yml'],
             cwd=cls.business.base_func_path)
        call(['faas-cli', 'deploy', '-f', f'./{service_name}.yml'],
             cwd=cls.business.base_func_path)

        # when not dev(publish), change the privacy etc
        if version != DEFAULT_DEPLOY_VERSION:
            app.privacy = 'public'
            app.versions.append(version)

        app.app_path = os.path.join(cls.business.base_func_path,
                                    service_name_no_v)
        app.status = 'active'
        app.save()

        return app

# @classmethod
# def add_used_app(cls, user_ID, app_id):
#     user = UserBusiness.get_by_user_ID(user_ID=user_ID)
#     app = cls.business.get_by_id(app_id)
#     user.used_apis.append(app)
#     user_result = user.save()
#     if user_result:
#         return {
#             "user": user_result.to_mongo(),
#         }

# def test_create_app():
#     data = {
#         "name": "预测航班延误",
#         "description": "预测航班延误信息",
#     }
#     AppService.create_project(name="预测航班延误", description="description")


if __name__ == '__main__':
    import sys
    sys.path.append('../../')

    AppService.app_deploy_or_publish("5af50c74ea8db714444d7205", "test", "/Users/Chun/Documents/workspace/momodel/mo/pyserver/user_directory/chun/my_exercise/Untitled.py")

    pass
