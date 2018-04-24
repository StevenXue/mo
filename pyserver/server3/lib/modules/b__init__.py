import os
import sys
import json
from importlib import import_module


class HiddenPrints:
    def __enter__(self):
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout = self._original_stdout


def module_general(module_id, action, *args, **kwargs):
    [user_ID, module_name, version] = module_id.split('/')
    version = '_'.join(version.split('.'))
    main_module = import_module(
        f'modules.{user_ID}.{module_name}.{version}.src.main')
    cls = getattr(main_module, module_name)()
    return getattr(cls, action)(*args, **kwargs)


def json_parser(json_obj):
    return json.loads(json_obj)


key = 'sss'


def check_client():
    def decorator(func):
        def wrapper(*args, **kw):
            if kw.pop('key'):
                return func(*args, **kw)
            else:
                raise Exception('Please call the modules using client provided!')
        return wrapper
    return decorator


def check_api_key():
    def decorator(func):
        def wrapper(self, *args, **kw):
            if self.api_key == 'fakePAI':
                return func(self, *args, **kw)
            else:
                raise Exception('API key permission error!')
        return wrapper
    return decorator


class Client:

    def __init__(self, api_key, silent=False):
        self.silent = silent
        self.api_key = api_key

    @check_api_key
    def run(self, module_id, *args, **kwargs):
        kwargs['key'] = key
        if self.silent:
            with HiddenPrints():
                return module_general(module_id, 'run', *args, **kwargs)
        return module_general(module_id, 'run', *args, **kwargs)

    @check_api_key
    def train(self, module_id, *args, **kwargs):
        kwargs['key'] = key
        if self.silent:
            with HiddenPrints():
                return module_general(module_id, 'train', *args, **kwargs)
        return module_general(module_id, 'train', *args, **kwargs)

    @check_api_key
    def predict(self, module_id, *args, **kwargs):
        kwargs['key'] = key
        if self.silent:
            with HiddenPrints():
                return module_general(module_id, 'predict', *args, **kwargs)
        return module_general(module_id, 'predict', *args, **kwargs)
