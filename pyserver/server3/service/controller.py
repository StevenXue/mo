from server3.lib import models


def to_code(conf, model):
    func = getattr(models, model.to_code_function)
    func(conf)


def run_code(conf, model):
    func = getattr(models, model.entry_function)
    func(conf)

