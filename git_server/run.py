# -*- coding: UTF-8 -*-
import os
import shutil
from subprocess import call

from flask import Flask
from flask import jsonify
from flask import request
from flask import Blueprint
import htpasswd
from git import Repo

app = Flask(__name__)

PREFIX = '/git'
REPO_ROOT = '/var/www/user_repos'
TPL = '/var/www/user_repos'
PASSWD = '/var/www/passwd.git'

git_app = Blueprint("git_app", __name__, url_prefix=PREFIX)


@git_app.route('/<user_ID>', methods=['POST'])
def add_user(user_ID):
    """
    called every time when user registered
    :param user_ID:
    :return:
    """
    data = request.get_json()
    password = data.get('password')
    # add user to passwd.git
    with htpasswd.Basic(PASSWD) as userdb:
        userdb.add(user_ID, password)
    return jsonify({'response': 1})


@git_app.route('/<user_ID>/<repo_name>', methods=['POST'])
def post(user_ID, repo_name):
    """
    create a new repo when project created
    :param user_ID:
    :param repo_name:
    :return:
    """
    repo_path = os.path.join(REPO_ROOT, user_ID, repo_name)
    if not os.path.exists(repo_path):
        os.makedirs(repo_path)
    # git init repo from template
    bare_repo = Repo.init(repo_path, bare=True,
                          template='./templates/')
    assert bare_repo.bare
    return jsonify({'response': 1})


@git_app.route('/<user_ID>/<repo_name>', methods=['DELETE'])
def delete(user_ID, repo_name):
    """
    delete repo when project deleted
    :param user_ID:
    :param repo_name:
    :return:
    """
    def onerror(func, path, exc_info):
        """
        Error handler for ``shutil.rmtree``.

        If the error is due to an access error (read only file)
        it attempts to add write permission and then retries.

        If the error is for another reason it re-raises the error.

        Usage : ``shutil.rmtree(path, onerror=onerror)``
        """
        import stat
        if not os.access(path, os.W_OK):
            # Is the error an access error ?
            os.chmod(path, stat.S_IWUSR)
            func(path)
        else:
            raise Exception('remove failed but not access error')

    repo_path = os.path.join(REPO_ROOT, user_ID, repo_name)

    shutil.rmtree(repo_path, onerror=onerror)
    return jsonify({'response': 1})


app.register_blueprint(git_app)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=2333, debug=True)
