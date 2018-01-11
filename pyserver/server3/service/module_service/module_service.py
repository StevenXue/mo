#!/usr/bin/python
# -*- coding: UTF-8 -*-
from server3.lib import modules
from importlib import import_module

def run_module(module_id, *args):
    [user_ID, module_name] = module_id.split('/')
    main = getattr(modules, '{}.{}.main'.format(user_ID, module_name))
    main.run(*args)


class Module:
    def __init__(self, module_id):
        [user_ID, module_name] = module_id.split('/')
        self.main = import_module('server3.lib.modules.{}.{}.main'.format(
            user_ID, module_name))

    def run(self, *args, **kwargs):
        return self.main.run(*args, **kwargs)


if __name__ == '__main__':
    pass

