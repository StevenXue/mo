from lib import keras_seq


def to_code(conf, model):
    func = getattr(keras_seq, model.to_code_function)
    func(conf)


def run_code(conf, model):
    func = getattr(keras_seq, model.entry_function)
    func(conf)

