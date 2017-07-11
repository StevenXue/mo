#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 11:00pm
# @function : Getting all of the model of statics analysis
# @running  : python
# Further to FIXME of None
"""

from server3.business import model_business, ownership_business, user_business
from server3.lib.models.keras_seq import keras_seq as ks
from server3.service import job_service


def get_all_public_model():
    models = [obj.model.to_mongo().to_dict() for obj in ownership_business.
              list_ownership_by_type_and_private('model', False)]
    print('models', len(models))
    return models


def list_public_model_name():
    all_names = []
    for tool in get_all_public_model():
        all_names.append(tool.model.name)
    return all_names


def add_model_with_ownership(user_ID, is_private, name, description, category,
                             target_py_code, entry_function,
                             to_code_function, parameter_spec, input):
    """
    add_model_with_ownership
    :param user_ID:
    :param is_private:
    :param name:
    :param description:
    :param category:
    :param target_py_code:
    :param entry_function:
    :param to_code_function:
    :param parameter_spec:
    :param input:
    :return:
    """
    model = model_business.add(name, description, category,
                               target_py_code, entry_function,
                               to_code_function, parameter_spec, input)
    user = user_business.get_by_user_ID(user_ID)
    ownership_business.add(user, is_private, model=model)
    return model


def run_model(conf, project_id, staging_data_set_id, model_id, **kwargs):
    """
    run model by model_id and the parameter config

    :param conf:
    :param project_id:
    :param staging_data_set_id:
    :param model_id:
    :param kwargs:
    :return:
    """
    job_service.run_code(conf, project_id, staging_data_set_id, model_id,
                         **kwargs)
    # controller.run_code(conf, model)


def run_multiple_model(conf, project_id, staging_data_set_id, model_id, **kwargs):
    """
    run model by model_id and the parameter config

    :param conf: conf of model with multiple set of parameters (hyper parameters)
    :param project_id:
    :param staging_data_set_id:
    :param model_id:
    :param kwargs:
    :return:
    """
    pass
    from server3.service.spark_service import hyper_parameters_tuning
    parameters_grid = get_parameters_grid(conf)
    result = hyper_parameters_tuning(parameters_grid)
    return result
    # print("result", result)
    # job_service.run_code(conf, project_id, staging_data_set_id, model_id,
    #                      **kwargs)
    # controller.run_code(conf, model)


# ------------------------------ temp function ------------------------------s
def get_parameters_grid(conf):
    import itertools
    import copy
    epochs = conf['fit']['args']['epochs']
    batch_size = conf['fit']['args']['batch_size']

    all_experiments = list(itertools.product(epochs, batch_size))
    parameters_grid = []
    for ex in all_experiments:
        conf_template = copy.deepcopy(conf)
        conf_template['fit']['args']['epochs'] = ex[0]
        conf_template['fit']['args']['batch_size'] = ex[1]
        parameters_grid.append(conf_template)
    # print(all_experiments)
    # for p in parameters_grid:
    #     print(p)
    return parameters_grid
# ------------------------------ temp function ------------------------------e


def model_to_code(conf, project_id, staging_data_set_id, model_id, **kwargs):
    """
    run model by model_id and the parameter config

    :param conf:
    :param project_id:
    :param staging_data_set_id:
    :param model_id:
    :param kwargs:
    :return:
    """
    return job_service.to_code(conf, project_id, staging_data_set_id, model_id,
                               **kwargs)
    # controller.run_code(conf, model)


def temp():
    add_model_with_ownership(
        'system',
        False,
        'keras_seq',
        'keras_seq from keras',
        0,
        '/lib/keras_seq',
        'keras_seq',
        'keras_seq_to_str',
        ks.KERAS_SEQ_SPEC,
        {'type': 'ndarray', 'n': None}
    )

if __name__ == '__main__':
    pass
    # temp()
