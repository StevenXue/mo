from server3.entity.module import Module
from server3.repository.general_repo import Repo
import datetime

module_repo = Repo(Module)


def add(user, name, user_ID, **kwargs):
    try:
        module_path = kwargs.pop("module_path")
    except KeyError:
        module_path = "/" + user.user_ID + "/" + name

    create_time = datetime.datetime.utcnow()
    model = Module(
        user=user, name=name, user_ID=user_ID,
        module_path=module_path,
        create_time=create_time, **kwargs)
    return module_repo.create(model)


def get_all():
    model_list = module_repo.read({})
    return model_list


def get_by_module_id(model_obj):
    return module_repo.read_by_id(model_obj)


def update_by_id(module_id, **update):
    return module_repo.update_one_by_id(module_id, update)
