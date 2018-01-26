import json
from importlib import import_module


def module_general(module_id, action, *args, **kwargs):
    [user_ID, module_name] = module_id.split('/')
    main = import_module(
        'modules.{user_ID}.{module_name}.src.main'.format(
            user_ID=user_ID, module_name=module_name))
    cls = getattr(main, module_name)()
    try:
        return getattr(cls, action)(*args, **kwargs)
    except AttributeError:
        raise AttributeError("Module doesn't have method '{}'.".format(action))


def json_parser(json_obj):
    args = json.loads(json_obj)
    return {arg.get('name'): arg.get('value')
                             or arg.get('values')
                             or arg.get('default')
            for arg in args}


class Client:

    def __init__(self, api_key):
        pass

    def run(self, module_id, *args, **kwargs):
        return module_general(module_id, 'run', *args, **kwargs)

    def train(self, module_id, *args, **kwargs):
        return module_general(module_id, 'train', *args, **kwargs)

    def predict(self, module_id, *args, **kwargs):
        return module_general(module_id, 'predict', *args, **kwargs)
