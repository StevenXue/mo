# !/usr/bin/python
# -*- coding: UTF-8 -*-

import os
import shutil
import re
import requests
import collections
import json
from copy import deepcopy
from datetime import datetime
# from distutils.dir_util import copy_tree
from git import Repo

from server3.entity.project import Project
from server3.entity.project import Commit
# from server3.repository import job_repo
from server3.repository.project_repo import ProjectRepo
from server3.business.user_business import UserBusiness
from server3.constants import USER_DIR
from server3.constants import HUB_SERVER
from server3.constants import GIT_SERVER
from server3.constants import ADMIN_TOKEN
from server3.entity.general_entity import Objects
from server3.constants import GIT_LOCAL
from server3.constants import INIT_RES
from server3.constants import GIT_SERVER_IP
from server3.business.general_business import GeneralBusiness
from server3.utility.file_utils import copytree

PAGE_NO = 1
PAGE_SIZE = 5

project_repo = ProjectRepo(Project)

# Objects = collections.namedtuple('Objects', ('objects', 'count', 'page_no', 'page_size'))
CommitObj = collections.namedtuple('CommitObj', ('project', 'commit_num'))


def add(name, description, tags, type, hub_token, project_path):
    """
    Add a new Project.

    :param name: str
    :param description: str
    :param tags: list
    :param type: str
    :param hub_token: str
    :return: added Project object
    """
    create_time = datetime.utcnow()
    project_obj = Project(name=name, description=description,
                          create_time=create_time, update_time=create_time,
                          type=type, tags=tags, hub_token=hub_token,
                          path=project_path)
    return project_repo.create(project_obj)


def add_by_obj(obj):
    return project_repo.create(obj)


def update_items_to_list_field(project_id, **update):
    project_repo.add_to_set(project_id, **update)


def get_by_id(object_id):
    """
    Get a project object by its ObjectId

    :param object_id: ObjectId
    :return: a matched Project object
    """
    # project = Project(id=object_id)
    return project_repo.read_by_id(object_id)


# def add_job_to_project(job_obj, project_obj):
#     return project_repo.update_one_by_id(project_obj, {'push__job': job_obj})
#
#
# def add_result_to_project(result_obj, project_obj):
#     return project_repo.update_one_by_id(project_obj, {'push__result': result_obj})
#
#
# def test(result_obj, project_obj):
#     return project_repo.add_and_update_one_by_id(project_obj, {'result': result_obj})


def remove_by_id(project_id):
    return project_repo.delete_by_id(project_id)


def insert_job_by_id(project_id, job_obj):
    return project_repo.add_to_set(project_id, jobs=job_obj)


def update_by_id(project_id, **update):
    return project_repo.update_one_by_id(project_id, update)


def add_and_update_one_by_id(project_id, result_obj, job_obj):
    return project_repo.insert_to_list_fields_by_id(project_id,
                                                    {'results': result_obj,
                                                     'jobs': job_obj})


def copy(project):
    project_cp = deepcopy(project)
    project_cp.id = None
    project_cp.jobs = []
    project_repo.create(project_cp)
    return project_cp


class ProjectBusiness(GeneralBusiness):
    project = None
    repo = ProjectRepo(Project)

    @staticmethod
    def copytree(o, dst, **kwargs):
        copytree(o, dst, **kwargs)

    @staticmethod
    def copytree_wrapper(o, dst, **kwargs):
        # if dir exists, remove it and copytree, cause copytree will
        # create the dir
        if os.path.exists(dst):
            shutil.rmtree(dst)
        return shutil.copytree(o, dst, **kwargs)

    @staticmethod
    def auth_hub_user(user_ID, project_name, user_token):
        """
        auth jupyterhub with user token
        :param user_ID:
        :param project_name:
        :param user_token:
        :return: dict of res json
        """
        return requests.post('{hub_server}/hub/api/authorizations/token'.
                             format(hub_server=HUB_SERVER),
                             json={'username': user_ID + '+' + project_name,
                                   'password': user_token}
                             ).json()

    @staticmethod
    def delete_hub_user(user_ID, project_name):
        """
        auth jupyterhub with user token
        :param user_ID:
        :param project_name:
        :param token:
        :return: dict of res json
        """
        url = '{hub_server}/hub/api/users/{user_ID}+{project_name}'.format(
            hub_server=HUB_SERVER, user_ID=user_ID,
            project_name=project_name)
        return requests.delete(url,
                               headers={
                                   'Authorization': 'token {}'.format(
                                       ADMIN_TOKEN)
                               })

    @staticmethod
    def init_git_repo(user_ID, repo_name):
        """
        auth jupyterhub with user token
        :param user_ID:
        :param repo_name:
        :return: dict of res json
        """
        return requests.post(f'{GIT_SERVER}/git/{user_ID}/{repo_name}')

    @staticmethod
    def remove_git_repo(user_ID, repo_name):
        """
        auth jupyterhub with user token
        :param user_ID:
        :param repo_name:
        :return: dict of res json
        """
        return requests.delete(f'{GIT_SERVER}/git/{user_ID}/{repo_name}')

    @staticmethod
    def gen_dir(user_ID, name):
        """
        gen_dir for project
        :param user_ID:
        :param project_name:
        :param token:
        :return: dict of res json
        """
        # check and create project dir
        project_path = os.path.join(USER_DIR, user_ID, name)
        if not os.path.exists(project_path):
            os.makedirs(project_path)
        else:
            # if exists means project exists
            raise Exception(
                'Project exists, project should be unique between apps, modules and datsets')
        return project_path

    @classmethod
    def get_objects(cls, search_query,
                    privacy,
                    page_no,
                    page_size,
                    default_max_score,
                    user, tags):
        # def get_objects(cls, search_query, user=None, page_no=PAGE_NO,
        #             page_size=PAGE_SIZE, default_max_score=0.4,
        #             privacy=None,tags=tags):

        start = (page_no - 1) * page_size
        end = page_no * page_size
        # 获取所有的
        if search_query:
            objects = cls.repo.search(search_query, {'name': 'icontains',
                                                     'description': 'icontains',
                                                     'tags': 'in'})
        else:
            objects = cls.repo.read()
        if privacy:
            objects = objects(privacy=privacy)
        if user:
            objects = objects(user=user)
        if tags:
            # todo 是否有直接的查询语句取代
            for each_tag in tags:
                objects = objects(tags=each_tag)

        count = objects.count()
        return Objects(objects=objects[start: end], count=count,
                       page_no=page_no, page_size=page_size)
        # return {
        #     "objects": objects.order_by('-create_time')[start:end],
        #     "count": count,
        #     "page_no": page_no,
        #     "page_size": page_size,
        # }

    @staticmethod
    def clone(user_ID, name, project_path):
        return Repo.clone_from(
            f'{GIT_LOCAL}/var/www/user_repos/{user_ID}/{name}',
            project_path)

    @classmethod
    def create_project(cls, name, description, user, privacy='private',
                       tags=None, user_token='', type='app',
                       create_tutorial=False, **kwargs):
        """
        Create a new project

        :param name: str
        :param description: str
        :param user_ID: ObjectId
        :param is_private: boolean
        :param type: string (app/module/dataset)
        :param tags: list of string
        :param user_token: string
        :param create_tutorial: boolean
        :return: a new created project object
        """
        if tags is None:
            tags = []
        user_ID = user.user_ID

        # generate project dir
        project_path = cls.gen_dir(user_ID, name)

        # init git repo
        cls.init_git_repo(user_ID, name)

        # clone to project dir
        repo = cls.clone(user_ID, name, project_path)

        if create_tutorial:
            # shutil.copy('tutorial/hello_world.ipynb', project_path)
            copytree('tutorial', project_path)

        # config repo user
        with repo.config_writer(config_level="repository") as c:
            c.set_value('user', 'name', user.user_ID)
            c.set_value('user', 'email', user.email)

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
            privacy=privacy, commits=[commit],
            repo_path=f'http://{GIT_SERVER_IP}/repos/{user_ID}/{name}',
            **kwargs)

    @classmethod
    def get_by_id(cls, project_id):
        """
        Get a project object by its ObjectId

        :param project_id: ObjectId
        :return: a matched Project object
        """
        project = cls.repo.read_by_id(project_id)
        cls.project = project
        return project

    @classmethod
    def get_by_identity(cls, identity):
        """
        Get a project object by its identity

        :param identity: string
        :return: a matched Project object
        """
        [user_ID, project_name] = identity.split('+')
        user = UserBusiness.get_by_user_ID(user_ID)
        project = cls.repo.read_unique_one(dict(name=project_name, user=user))
        cls.project = project
        return project

    @classmethod
    def remove_project_by_id(cls, project_id, user_ID):
        """
        remove project by its object_id
        :param user_ID:
        :param project_id: object_id of project to remove
        :return:
        """
        project = cls.get_by_id(project_id)
        # check ownership
        if user_ID != project.user.user_ID:
            raise ValueError('project not belong to this user, cannot delete')
        # delete tmp jupyterhub user
        cls.delete_hub_user(user_ID, project.name)
        # delete project directory
        if project.type == 'app':
            paths = [
                project.path,
                '-'.join([getattr(project, 'app_path') or 'NO_PATH', 'dev']),
            ]
        elif project.type == 'module':
            paths = [
                project.path,
                os.path.join(getattr(project, 'module_path') or 'NO_PATH',
                             'dev')
            ]
        else:
            paths = [
                project.path,
            ]
        for path in paths:
            if 'NO_PATH' not in path:
                if os.path.isdir(path):
                    shutil.rmtree(path)
        # remove git repo
        cls.remove_git_repo(user_ID, project.name)
        # delete project object
        return cls.repo.delete_by_id(project_id)

    @classmethod
    def update_project(cls, project_id, **data):
        """
        Update project

        :param name: str
        :param description: str
        :param user_ID: ObjectId
        :param is_private: boolean
        :return: a new created project object
        """
        return cls.repo.update_one_by_id(project_id, data)

    @classmethod
    def update_project_by_identity(cls, project_name, **data):
        """
        Update project

        :param project_name:
        :return: a new created project object
        """
        [user_ID, project_name] = project_name.split('+')
        user = UserBusiness.get_by_user_ID(user_ID)
        return cls.repo.update_unique_one(dict(name=project_name, user=user),
                                          data)

    @classmethod
    def commit(cls, project_id, commit_msg, version=None):
        """
        commit project

        :param commit_msg:
        :param project_id:
        :param version:
        :return: a new created project object
        """
        project = cls.get_by_id(project_id)
        repo = Repo(project.path)
        # add all
        repo.git.add(A=True)
        repo.index.commit(commit_msg)
        repo.remote(name='origin').pull()
        repo.remote(name='origin').push(o=project_id)
        cls.update_project_commits(repo, project, version)
        return project

    @staticmethod
    def update_project_commits(repo, project=None, version=None):
        heads = repo.heads
        master = heads.master
        commit = master.log()[-1]
        commit = Commit(oldhexsha=commit.oldhexsha,
                        newhexsha=commit.newhexsha,
                        actor_name=commit.actor.name,
                        actor_email=commit.actor.email,
                        timestamp=datetime.fromtimestamp(commit.time[0]),
                        # + commit.time[1]), need utc
                        message=commit.message,
                        version=version
                        )
        if project:
            project.commits.append(commit)
            project.save()
        return commit

    @classmethod
    def get_commits(cls, project_path):
        # todo 临时使用，更改数据库后删除try
        try:
            repo = Repo.init(project_path)
            heads = repo.heads
            master = heads.master
        except:
            return []
        else:
            return master.log()

    @classmethod
    def nb_to_py_script(cls, project_id, nb_path, optimise=True):
        """

        Convert notebook file to python script to deploy

        :param project_id: project's ObjectId in mongodb
        :param nb_path: notebook file path
        :param optimise: flag to optimise some settings
        :return: N/A
        """
        app = cls.get_by_id(project_id)
        full_path = os.path.join(app.path, nb_path)

        # read source notebook file
        with open(full_path, 'r') as f:
            nb_data = json.loads(f.read())

        # write to destination file
        script = ''
        for cell in nb_data['cells']:
            if cell['cell_type'] == 'code':
                for line in cell['source']:
                    if optimise:
                        script += '\n' + cls.code_formatting(line)
                    else:
                        script += '\n' + line

        script = script.replace('\n\n', '\n')

        # add __main__ function
        main_func = \
            "\n" + \
            "\t# return your result consistent with .yml you defined\n" + \
            "\t# .e.g return {'iris_class': 1, 'possibility': '88%'}" + \
            "\n\n" + \
            "if __name__ == '__main__':\n" + \
            "\tconf = {}\n" + \
            "\thandle(conf)"
        script += '\n' + main_func

        script_path = full_path.replace('ipynb', 'py')
        with open(script_path, 'w') as f:
            f.write(script)

    @classmethod
    def code_formatting(cls, line_of_code):
        """

        Process line of code to be prepared for deployment.

        :param line_of_code: the line of code to be formatted
        :return: processed single line code
        """
        if any(re.search(reg, line_of_code.rstrip()) for reg in INIT_RES):
            # replace some redundant comments
            line_of_code = re.sub(r'# Define root path', r'',
                                  line_of_code.rstrip())
            line_of_code = re.sub(r"""sys.path.append\('(.+)'\)""", r'',
                                  line_of_code.rstrip())

            # set the flag to silent mode
            line_of_code = re.sub(
                r"""(\s+)project_type='(.+)', source_file_path='(.+)'\)""",
                r"""\1project_type='\2', source_file_path='\3', silent=True)""",
                line_of_code.rstrip())

            line_of_code = re.sub(r"""from modules import (.+)""",
                                  r"""from function.modules import \1""",
                                  line_of_code.rstrip())

            # add handle function
            line_of_code = re.sub(
                r"work_path = '\./'",
                r"work_path = './'\n\n\n\n"
                r"def handle(conf):\n"
                r"\t# paste your code here",
                line_of_code.rstrip())
        else:

            # erase magic function start with '!'
            if re.match(r'^(!)', line_of_code.strip()):
                line_of_code = ''
            else:
                line_of_code = '\t' + line_of_code


        return line_of_code

    # @classmethod
    # def nb_to_script(cls, project_id, nb_path, optimise=True):
    #     app = cls.get_by_id(project_id)
    #     call(['jupyter', 'nbconvert', '--to', 'script', nb_path],
    #          cwd=app.path)
    #     full_path = os.path.join(app.path, nb_path)
    #     script_path = full_path.replace('ipynb', 'py')
    #     for line in fileinput.input(files=script_path, inplace=1):
    #         # remove input tag comments
    #         line = re.sub(r"# In\[(\d+)\]:", r"", line.rstrip())
    #
    #         if optimise:
    #             if any(re.search(reg, line.rstrip()) for reg in INIT_RES):
    #                 line = re.sub(
    #                     r"# Please use current \(work\) folder to store your data "
    #                     r"and models",
    #                     r'', line.rstrip())
    #                 line = re.sub(r"""sys.path.append\('(.+)'\)""", r'',
    #                               line.rstrip())
    #                 line = re.sub(
    #                     r"""(\s+)project_type='(.+)', source_file_path='(.+)'\)""",
    #                     r"""\1project_type='\2', source_file_path='\3', silent=True)""",
    #                     line.rstrip())
    #
    #                 line = re.sub(r"""from modules import (.+)""",
    #                               r"""from function.modules import \1""",
    #                               line.rstrip())
    #
    #                 # add handle function
    #                 line = re.sub(
    #                     r"work_path = '\./'",
    #                     r"work_path = '11./'\n\n"
    #                     r"def handle(conf):\n"
    #                     r"\t# paste your code here",
    #                     line.rstrip())
    #             else:
    #                 line = '\t' + line
    #         print(line)
    #     my_open = open(script_path, 'a')
    #     # main_func = r"if __name__ == '__main__':" \
    #     #             r"" + "\n" + "\t" + "conf = {}" + "\n" +"\t" + "handle()"
    #     main_func = r"if __name__ == '__main__': " + "\n" + "\t" \
    #                                                         r"conf = {}" + "\n" + "\t" \
    #                                                                               r"handle(conf)"
    #
    #     my_open.write(main_func)
