#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 11:00pm
# @function : Getting all of the job of statics analysis
# @running  : python
# Further to FIXME of None
"""


import functools

from bson import ObjectId

from server3.business import toolkit_business
from server3.business import job_business
from server3.business import result_business
from server3.business import project_business
from server3.business import staging_data_set_business
from server3.business import model_business
from server3.service import staging_data_service

from server3.lib import models
from server3.repository import job_repo


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
            from server3.service import project_service

            # create a job
            toolkit_obj = toolkit_business.get_by_toolkit_id(toolkit_id)
            staging_data_set_obj = staging_data_set_business.get_by_id(staging_data_set_id)
            project_obj = project_business.get_by_id(project_id)

            argv = fields
            job_obj = job_business.add_toolkit_job(toolkit_obj,
                                                   staging_data_set_obj,
                                                   project_obj,
                                                   *argv)
            # update a project
            project_service.add_job_to_project(job_obj, ObjectId(project_id))
            # create result sds for toolkit
            sds_name = '%s_%s_result' % (toolkit_obj['name'], job_obj['id'])
            result_sds_obj = staging_data_set_business.add(sds_name, 'des',
                                                           project_obj,
                                                           job=job_obj,
                                                           type='result')

            # calculate
            func_result = func(*args, **kw)
            # update a job
            job_business.end_job(job_obj)

            # create a result, future TODO => add description
            result_obj = result_business.add_result(func_result, job_obj, 0, "")

            # 判断是否存储结果到staging_data_set

            if toolkit_obj.result_form == 2 or 1:


            # 已经淘汰，没有result了
            # from server3.service import project_service
            # # update a project
            # project_service.add_job_and_result_to_project(result_obj, ObjectId(project_id))
                return result_obj
        return wrapper
    return decorator


def create_model_job(project_id, staging_data_set_id, model_obj, *argv):
    """
    help model to create a job before model runs,
    as well as save the job & create a result after toolkit runs
    :param project_id: project_id, staging_data_set_id, toolkit_id
    :param staging_data_set_id: project_id, staging_data_set_id, toolkit_id
    :param model_obj: project_id, staging_data_set_id, toolkit_id
    :return:
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kw):
            # create a job
            # model_obj = model_business.get_by_model_id(model_id)
            print(args)
            params = args[0]
            staging_data_set_obj = \
                staging_data_set_business.get_by_id(staging_data_set_id)
            project_obj = project_business.get_by_id(project_id)

            # create model job
            job_obj = job_business.add_model_job(model_obj,
                                                 staging_data_set_obj,
                                                 project_obj,
                                                 params=params)
            # update a project
            from server3.service import project_service
            project_service.add_job_to_project(job_obj, ObjectId(project_id))
            # create result sds for model
            sds_name = '%s_%s_result' % (model_obj['name'], job_obj['id'])
            result_sds_obj = staging_data_set_business.add(sds_name, 'des',
                                                           project_obj,
                                                           job=job_obj,
                                                           type='result')
            # run
            func_result = func(*args, **kw, result_sds=result_sds_obj,
                               project_id=project_id)
            # update a job
            job_obj = job_business.end_job(job_obj)

            # create a result
            # result_obj = result_business.add_result(func_result, job_obj, 0, "")

            return func_result
        return wrapper
    return decorator


def get_job_from_result(result_obj):
    return result_business.get_result_by_id(result_obj['id']).job


def split_supervised_input(staging_data_set_id, x_fields, y_fields, schema):
    obj = staging_data_service.split_x_y(staging_data_set_id, x_fields,
                                         y_fields)
    return staging_data_service.split_test_train(obj, schema=schema)


# def to_code(conf, project_id, staging_data_set_id, model, *args):
#     """
#     convert config to code string
#
#     :param conf:
#     :param project_id:
#     :param staging_data_set_id:
#     :param model:
#     :return:
#     """
#     func = getattr(models, model.to_code_function)
#     func = create_model_job(project_id, staging_data_set_id, model)(func)
#     return func(conf, *args)


def run_code(conf, project_id, staging_data_set_id, model, f, *args):
    """
    run supervised learning code
    :param conf:
    :param project_id:
    :param staging_data_set_id:
    :param model:
    :param f:
    :return:
    """
    # add decorator
    func = create_model_job(project_id, staging_data_set_id, model)(f)
    # run model with decorator
    return func(conf, *args)


def list_by_project_id(project_id):
    project = project_business.get_by_id(project_id)
    return job_business.get_by_project(project)


if __name__ == '__main__':
    pass
    # to_code({'layers': [{'name': 'Dense',
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
    #           'fit': {'x_train': ['11', '11', '11', '11', '11', '11',
    #                               '11', '11', '11', '11', '11', '11',
    #                               '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11', '11'],
    #                   'y_train': '11',
    #                   'x_val': '11',
    #                   'y_val': '11',
    #                   'args': {
    #                       'epochs': 20,
    #                       'batch_size': 128
    #                   }
    #                   },
    #           'evaluate': {'x_test': '11',
    #                        'y_test': '11',
    #                        'args': {
    #                            'batch_size': 128
    #                        }
    #                        }
    #           }, "595f32e4e89bde8ba70738a3", "5934d1e5df86b2c9ccc7145a",
    #          "59562a76d123ab6f72bcac23", schema='seq')
