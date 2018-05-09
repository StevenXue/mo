import os
import sys
import json
import inspect
from importlib import import_module

import requests

SERVER = 'http://host.docker.internal:8989/pyapi'


class RedirectPrints:
    def __init__(self, job_id):
        self.job_id = job_id

    def __enter__(self):
        self._original_stdout = sys.stdout
        self._original_stderr = sys.stderr
        sys.stdout = Logger(self.job_id, 'stdout')
        sys.stderr = Logger(self.job_id, 'stderr')

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout = self._original_stdout
        sys.stderr = self._original_stderr


class HiddenPrints:
    def __enter__(self):
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout = self._original_stdout


class Logger(object):
    def __init__(self, job_id, log_type):
        self.job_id = job_id
        self.log_type = log_type
        self.terminal = sys.stdout

    def write(self, message):
        self.terminal.write(message)
        # job log
        job_id = self.job_id
        requests.put(f'{SERVER}/jobs/{job_id}/log',
                     json={'log_type': self.log_type, 'message': message})

    def flush(self):
        # this flush method is needed for python 3 compatibility.
        # this handles the flush command by doing nothing.
        # you might want to specify some extra behavior here.
        pass


def module_general(module_id, action, *args, **kwargs):
    [user_ID, module_name, version] = module_id.split('/')
    version = '_'.join(version.split('.'))
    main_module = import_module(
        f'modules.{user_ID}.{module_name}.{version}.src.main')
    cls = getattr(main_module, module_name)()
    return getattr(cls, action)(*args, **kwargs)


def json_parser(json_obj):
    return json.loads(json_obj)


class Client:

    def __init__(self, api_key, project_id, user_ID, project_type, source_file_path, silent=False):
        self.silent = silent
        self.api_key = api_key
        self.project_id = project_id
        self.user_ID = user_ID
        self.project_type = project_type
        self.source_file_path = source_file_path

    def controller(self, func, *args, **kw):
        # print('func', dir(func))
        # print('args', args)
        # print('kw', kw)
        # print('project_id', self.project_id)
        # print('project_type', self.project_type)
        # print('code', inspect.getsource(func))
        if func.__name__ == 'module_general':
            other = {
                'running_module': args[0]
            }
        else:
            other = {
                'running_code': inspect.getsource(func)
            }
        # log start
        job = requests.post(f'{SERVER}/jobs',
                            json={'project_id': self.project_id, 'type': self.project_type,
                                  'source_file_path': self.source_file_path,
                                  'user_ID': self.user_ID,
                                  'run_args': {'args': args, 'kwargs': kw}, **other},
                            ).json()['response']
        job_id = job['_id']
        with RedirectPrints(job_id):
            ret = func(*args, **kw)

        # log end
        job = requests.put(f'{SERVER}/jobs/{job_id}/success').json()
        # print('finish run', job)
        return ret

    def run(self, module_id, *args, with_control=False, **kwargs):
        if self.silent and with_control:
            with HiddenPrints():
                return self.controller(module_general, module_id, 'run', *args, **kwargs)
        elif not self.silent and with_control:
            return self.controller(module_general, module_id, 'run', *args, **kwargs)
        elif self.silent and not with_control:
            with HiddenPrints():
                return module_general(module_id, 'run', *args, **kwargs)
        else:
            return module_general(module_id, 'run', *args, **kwargs)

    def train(self, module_id, *args, with_control=False, **kwargs):
        if self.silent and with_control:
            with HiddenPrints():
                return self.controller(module_general, module_id, 'train', *args, **kwargs)
        elif not self.silent and with_control:
            return self.controller(module_general, module_id, 'train', *args, **kwargs)
        elif self.silent and not with_control:
            with HiddenPrints():
                return module_general(module_id, 'train', *args, **kwargs)
        else:
            return module_general(module_id, 'train', *args, **kwargs)

    def predict(self, module_id, *args, with_control=False, **kwargs):
        if self.silent and with_control:
            with HiddenPrints():
                return self.controller(module_general, module_id, 'predict', *args, **kwargs)
        elif not self.silent and with_control:
            return self.controller(module_general, module_id, 'predict', *args, **kwargs)
        elif self.silent and not with_control:
            with HiddenPrints():
                return module_general(module_id, 'predict', *args, **kwargs)
        else:
            return module_general(module_id, 'predict', *args, **kwargs)
