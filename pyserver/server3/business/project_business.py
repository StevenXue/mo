# !/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-24 11:00pm
# @function : Getting all of the job of statics analysis
# @running  : python
# Further to FIXME of None
"""
# -*- coding: UTF-8 -*-
import os
import shutil
import re
import fileinput
import requests
import collections
from copy import deepcopy
from datetime import datetime
# from distutils.dir_util import copy_tree
from subprocess import call

from git import Repo
from flask_socketio import SocketIO

from eventlet import spawn_n

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
from server3.constants import REDIS_SERVER
from server3.business.request_answer_business import RequestAnswerBusiness
from server3.constants import GIT_SERVER_IP

socketio = SocketIO(message_queue=REDIS_SERVER)

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


def copytree(src, dst, symlinks=False, ignore=None, copy_function=shutil.copy2,
             ignore_dangling_symlinks=False):
    """Recursively copy a directory tree.

    The destination directory must not already exist.
    If exception(s) occur, an Error is raised with a list of reasons.

    If the optional symlinks flag is true, symbolic links in the
    source tree result in symbolic links in the destination tree; if
    it is false, the contents of the files pointed to by symbolic
    links are copied. If the file pointed by the symlink doesn't
    exist, an exception will be added in the list of errors raised in
    an Error exception at the end of the copy process.

    You can set the optional ignore_dangling_symlinks flag to true if you
    want to silence this exception. Notice that this has no effect on
    platforms that don't support os.symlink.

    The optional ignore argument is a callable. If given, it
    is called with the `src` parameter, which is the directory
    being visited by copytree(), and `names` which is the list of
    `src` contents, as returned by os.listdir():

        callable(src, names) -> ignored_names

    Since copytree() is called recursively, the callable will be
    called once for each directory that is copied. It returns a
    list of names relative to the `src` directory that should
    not be copied.

    The optional copy_function argument is a callable that will be used
    to copy each file. It will be called with the source path and the
    destination path as arguments. By default, copy2() is used, but any
    function that supports the same signature (like copy()) can be used.

    """
    names = os.listdir(src)
    if ignore is not None:
        ignored_names = ignore(src, names)
    else:
        ignored_names = set()

    os.makedirs(dst, exist_ok=True)
    errors = []
    for name in names:
        if name in ignored_names:
            continue
        srcname = os.path.join(src, name)
        dstname = os.path.join(dst, name)
        try:
            if os.path.islink(srcname):
                linkto = os.readlink(srcname)
                if symlinks:
                    # We can't just leave it to `copy_function` because legacy
                    # code with a custom `copy_function` may rely on copytree
                    # doing the right thing.
                    os.symlink(linkto, dstname)
                    shutil.copystat(srcname, dstname, follow_symlinks=not
                    symlinks)
                else:
                    # ignore dangling symlink if the flag is on
                    if not os.path.exists(linkto) and ignore_dangling_symlinks:
                        continue
                    # otherwise let the copy occurs. copy2 will raise an error
                    if os.path.isdir(srcname):
                        copytree(srcname, dstname, symlinks, ignore,
                                 copy_function)
                    else:
                        copy_function(srcname, dstname)
            elif os.path.isdir(srcname):
                copytree(srcname, dstname, symlinks, ignore, copy_function)
            else:
                # Will raise a SpecialFileError for unsupported file types
                copy_function(srcname, dstname)
        # catch the Error from the recursive copytree so that we can
        # continue with other files
        except shutil.Error as err:
            errors.extend(err.args[0])
        except OSError as why:
            errors.append((srcname, dstname, str(why)))
    try:
        shutil.copystat(src, dst)
    except OSError as why:
        # Copying file access times may fail on Windows
        if getattr(why, 'winerror', None) is None:
            errors.append((src, dst, str(why)))
    if errors:
        raise shutil.Error(errors)
    return dst


class ProjectBusiness:
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
        auth jupyterhub with user token
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
            raise Exception('project exists')
        return project_path

    @classmethod
    def get_objects(cls, search_query, user=None, page_no=PAGE_NO,
                    page_size=PAGE_SIZE, default_max_score=0.4,
                    privacy=None):
        """
        Search for objects

        :param search_query:
        :param user:
        :param page_no:
        :param page_size:
        :param default_max_score:
        :return:
        """

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
                       tags=None, user_token='', type='app', **kwargs):
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

        # init git repo
        cls.init_git_repo(user_ID, name)

        # clone to project dir
        repo = cls.clone(user_ID, name, project_path)

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
    def nb_to_script(cls, project_id, nb_path, optimise=True):
        app = cls.get_by_id(project_id)
        call(['jupyter', 'nbconvert', '--to', 'script', nb_path],
             cwd=app.path)
        full_path = os.path.join(app.path, nb_path)
        script_path = full_path.replace('ipynb', 'py')
        for line in fileinput.input(files=script_path, inplace=1):
            # remove input tag comments
            line = re.sub(r"# In\[(\d+)\]:", r"", line.rstrip())

            if optimise:
                if any(re.search(reg, line.rstrip()) for reg in INIT_RES):
                    line = re.sub(
                        r"# Please use current \(work\) folder to store your data "
                        r"and models",
                        r'', line.rstrip())
                    line = re.sub(r"sys.path.append\('\.\./'\)", r'',
                                  line.rstrip())
                    line = re.sub(r"""client = Client\('(.+)'\)""",
                                  r"""client = Client('\1', silent=True)""",
                                  line.rstrip())
                    line = re.sub(r"""from modules import (.+)""",
                                  r"""from function.modules import \1""",
                                  line.rstrip())

                    # add handle function
                    line = re.sub(
                        r"work_path = ''",
                        r"work_path = ''\n\n"
                        r"def handle(conf):\n"
                        r"\t# paste your code here",
                        line.rstrip())
                else:
                    line = '\t' + line
            print(line)
        my_open = open(script_path, 'a')
        # main_func = r"if __name__ == '__main__':" \
        #             r"" + "\n" + "\t" + "conf = {}" + "\n" +"\t" + "handle()"
        main_func = r"if __name__ == '__main__': " + "\n" + "\t" \
                    r"conf = {}" + "\n" + "\t" \
                    r"handle()"

        my_open.write(main_func)
