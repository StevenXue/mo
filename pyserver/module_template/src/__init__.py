from importlib import import_module


def module_general(module_id, action, *args, **kwargs):
    [user_ID, module_name] = module_id.split('/')
    main = import_module(
        'modules.{user_ID}.{module_name}.src.main'.format(
            user_ID=user_ID, module_name=module_name))
    cls = getattr(main, module_name)()
    getattr(cls, action)(*args, **kwargs)


class Client:

    def __init__(self, api_key):
        print('Module Client Initialized.')

    def run(self, module_id, *args, **kwargs):
        module_general(module_id, 'run', *args, **kwargs)

    def train(self, module_id, *args, **kwargs):
        module_general(module_id, 'run', *args, **kwargs)

    def predict(self, module_id, *args, **kwargs):
        module_general(module_id, 'run', *args, **kwargs)
