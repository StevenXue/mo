#!/usr/bin/python
# -*- coding: UTF-8 -*-
'''
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 11:00pm
# @function : Getting all of the job of statics analysis
# @running  : python
# Further to FIXME of None
'''


import functools
from bson import ObjectId

from business import toolkit_business
from business import job_business
from business import result_business
from business import project_business
from business import staging_data_set_business
from business import model_business
from service import staging_data_service

from lib import keras_seq
from repository import job_repo


def create_toolkit_job(project_id, staging_data_set_id, toolkit_id, fields):
    """
    help toolkit to create a job before toolkit runs,
    as well as save the job & create a result after toolkit runs
    :param project_id: project_id, staging_data_set_id, toolkit_id
    :param staging_data_set_id: project_id, staging_data_set_id, toolkit_id
    :param toolkit_id: project_id, staging_data_set_id, toolkit_id
    :param fields: project_id, staging_data_set_id, toolkit_id
    :return:
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kw):
            # create a job
            toolkit_obj = toolkit_business.get_by_toolkit_id(toolkit_id)
            staging_data_set_obj = staging_data_set_business.get_by_id(staging_data_set_id)

            argv = fields
            job_obj = job_business.add_toolkit_job(toolkit_obj, staging_data_set_obj, *argv)
            # job_obj = job_business.add_toolkit_job(toolkit_obj, '123')

            # calculate
            func_result = func(*args, **kw)
            # update a job
            job_obj = job_business.end_job(job_obj)

            # create a result, future TODO => add description
            result_obj = result_business.add_result(func_result, job_obj, 0, "")

            from service import project_service
            # update a project
            project_service.add_job_and_result_to_project(result_obj, ObjectId(project_id))
            return result_obj
        return wrapper
    return decorator


def create_model_job(project_id, staging_data_set_id, model_obj, *argv):
    """
    help toolkit to create a job before toolkit runs,
    as well as save the job & create a result after toolkit runs
    :param project_id: project_id, staging_data_set_id, toolkit_id
    :param staging_data_set_id: project_id, staging_data_set_id, toolkit_id
    :param model_obj: project_id, staging_data_set_id, toolkit_id
    :param fields: project_id, staging_data_set_id, toolkit_id
    :return:
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kw):
            # create a job
            # model_obj = model_business.get_by_model_id(model_id)
            staging_data_set_obj = \
                staging_data_set_business.get_by_id(staging_data_set_id)

            # create model job
            job_obj = job_business.add_model_job(model_obj,
                                                 staging_data_set_obj, *argv)
            # create result sds for model
            project_obj = project_business.get_by_id(project_id)
            sds_name = '%s_%s_result' % (model_obj['name'], job_obj['id'])
            result_sds_obj = staging_data_set_business.add(sds_name, 'des',
                                                           project_obj,
                                                           job=job_obj,
                                                           type='result')

            # run
            func_result = func(*args, **kw, result_sds=result_sds_obj)
            # update a job
            job_obj = job_business.end_job(job_obj)

            # create a result
            # result_obj = result_business.add_result(func_result, job_obj, 0, "")

            # update a project
            from service import project_service
            project_service.add_job_to_project(job_obj, ObjectId(project_id))
            return job_obj
        return wrapper
    return decorator


def get_job_from_result(result_obj):
    return result_business.get_result_by_id(result_obj['id']).job


def to_code(conf, model):
    """
    convert config to code string
    :param conf:
    :param model:
    :return:
    """
    func = getattr(keras_seq, model.to_code_function)
    func(conf)


def manage_supervised_input(conf, staging_data_set_id, **kwargs):
    """
    deal with input when supervised learning
    :param conf:
    :param staging_data_set_id:
    :return:
    """
    x_fields = conf['fit']['x_train']
    y_fields = conf['fit']['y_train']
    schema = kwargs.pop('schema')
    obj = staging_data_service.split_x_y(staging_data_set_id, x_fields,
                                         y_fields)
    obj = staging_data_service.split_test_train(obj,
                                                schema=schema)
    conf['fit']['x_train'] = obj['x_tr']
    conf['fit']['y_train'] = obj['y_tr']
    conf['evaluate']['x_test'] = obj['x_te']
    conf['evaluate']['y_test'] = obj['y_te']
    return conf


def run_code(conf, project_id, staging_data_set_id, model_id, **kwargs):
    """
    run supervised learning code
    :param conf:
    :param project_id:
    :param staging_data_set_id:
    :param model_id:
    :return:
    """
    model = model_business.get_by_model_id(model_id)
    if model['category'] == 0:
        conf = manage_supervised_input(conf, staging_data_set_id, **kwargs)
    func = getattr(keras_seq, model.entry_function)
    func = create_model_job(project_id, staging_data_set_id, model)(func)
    func(conf)


if __name__ == '__main__':
    # get data
    from keras import utils
    # Generate dummy data
    import numpy as np
    x_train = np.random.random((1000, 20))
    y_train = utils.to_categorical(np.random.randint(10, size=(1000, 1)),
                                   num_classes=10)
    x_test = np.random.random((100, 20))
    y_test = utils.to_categorical(np.random.randint(10, size=(100, 1)),
                                  num_classes=10)
    print(x_train.shape)
    # run_code({'layers': [{'name': 'Dense',
    #                       'args': {'units': 64, 'activation': 'relu', 'input_shape': [
    #                           20, ]}},
    #                      {'name': 'Dropout',
    #                       'args': {'rate': 0.5}},
    #                      {'name': 'Dense',
    #                       'args': {'units': 64, 'activation': 'relu'}},
    #                      {'name': 'Dropout',
    #                       'args': {'rate': 0.5}},
    #                      {'name': 'Dense',
    #                       'args': {'units': 10, 'activation': 'softmax'}}
    #                      ],
    #           'compile': {'loss': 'categorical_crossentropy',
    #                       'optimizer': 'SGD',
    #                       'metrics': ['accuracy']
    #                       },
    #           'fit': {'x_train': x_train,
    #                   'y_train': y_train,
    #                   'args': {
    #                       'epochs': 20,
    #                       'batch_size': 128
    #                   }
    #                   },
    #           'evaluate': {'x_test': x_test,
    #                        'y_test': y_test,
    #                        'args': {
    #                            'batch_size': 128
    #                        }
    #                        }
    #           }, "595453ebe89bde2da1cbff50", "5934d1e5df86b2c9ccc7145a",
    #          "59562a76d123ab6f72bcac23")
