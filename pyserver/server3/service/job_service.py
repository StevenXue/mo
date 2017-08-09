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
import numpy as np

from bson import ObjectId
from itertools import compress

from server3.business import toolkit_business
from server3.business import job_business
from server3.business import result_business
from server3.business import project_business
from server3.business import staging_data_business
from server3.business import staging_data_set_business
from server3.service import staging_data_service
from server3.service import logger_service

from server3.utility import data_utility
from server3.lib import models


def create_toolkit_job(project_id, staging_data_set_id, toolkit_obj, fields):
    """
    help toolkit to create a job before toolkit runs,
    as well as save the job & create a result after toolkit runs
    :param project_id: project_id, staging_data_set_id, toolkit_id
    :param staging_data_set_id: project_id, staging_data_set_id, toolkit_id
    :param toolkit_obj: project_id, staging_data_set_id, toolkit_id
    :param fields: project_id, staging_data_set_id, toolkit_id
    :return:
    """
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kw):
            from server3.service import project_service

            # create a job
            staging_data_set_obj = staging_data_set_business.get_by_id(staging_data_set_id)
            project_obj = project_business.get_by_id(project_id)
            job_spec = {
                "fields": {
                    "source": fields[0],
                    "target": fields[1]},
                "params": kw
            }
            job_obj = job_business.add_toolkit_job(toolkit_obj,
                                                   staging_data_set_obj,
                                                   project_obj,
                                                   **job_spec)
            # update a project
            project_service.add_job_to_project(job_obj, ObjectId(project_id))

            # calculate
            func_rst = func(*args, **kw)
            result = list(func_rst) if isinstance(func_rst, tuple) else [func_rst]
            # 新设计的存取方式
            results = {"fields": fields}
            gen_info = {}
            result_spec = toolkit_obj.result_spec
            error_flag = 0

            for arg in result_spec["args"]:
                value = result.pop(0)
                results.update({arg["name"]: value})
                if arg["if_add_column"]:
                    strr = "%s_%s_col" % (arg["name"], toolkit_obj.name)
                    try:
                        add_new_column(value, args[-1], strr, staging_data_set_id)
                    except:
                        error_flag = 1

                if arg.get("attribute", False) and arg["attribute"] == "label":
                    labels = value
                elif arg.get("attribute", False) and arg["attribute"] == "general_info":
                    gen_info.update({arg["name"]: value})

            # 可视化计算
            if toolkit_obj.category == 0:
                json = {"scatter": data_utility.retrieve_nan_index(args[0], args[-1]), "labels": labels,
                        "pie": [{'text': el, 'value': labels.count(el)} for el in set(labels)],
                        "centers": results["Centroids of Clusters"],
                        "general_info": gen_info,
                        "fields": fields[0],
                        "category": toolkit_obj.category}

            elif toolkit_obj.category == 1:
                from scipy.stats import pearsonr
                # from minepy import MINE
                data = list(zip(*args[0]))
                target = args[1]
                json = {"Y_target": fields[1],
                        "X_fields": fields[0],
                        "labels": labels,
                        "bar": results["scores"],
                        "general_info": {"Selected Features": "%s out of %s" % (len(list(filter(lambda x: x is True, labels))),
                                                                                len(fields[0])),
                                         "Selected Fields": " ".join(str(el) for el in list(compress(fields[0], labels))),
                                         "Number of NaN": len(args[2])},
                        "scatter": {"y_domain": target,
                                    "x_domain": data,
                                    "pearsonr": [pearsonr(el, target)[0] for el in data],
                                    # "mic": [MINE(alpha=0.6, c=15, est="mic_approx").compute_score(el,
                                    # list(data[0]).mic()) for el in list(data[1:])]}
                                    "mic": [None for el in data]},
                        "category": toolkit_obj.category}

            elif toolkit_obj.category == 2:
                data = list(zip(*args[0]))
                result = list(zip(*labels))
                merge_data = data + result
                lab_fields = ["New Col" + str(i) for i in range(len(result))]
                merge_fields = fields[0] + lab_fields
                json = {"category": toolkit_obj.category,
                        "table": {
                            "Field1": fields[0],
                            "Field2": lab_fields,
                            "data": [dict(zip(merge_fields, arr)) for arr in merge_data]
                        }
                        }

            elif toolkit_obj.category == 3:
                if error_flag:
                    json = {}
                else:
                    flag = toolkit_obj.parameter_spec["data"]["type"]["key"] == "transfer_box"
                    data = list(zip(*args[0]))

                    if flag:
                        data.append(args[1])
                    lab = list(zip(*labels))
                    lab_fields = ["New Col" + str(i) for i in range(len(lab))]
                    var1 = [np.var(da) for da in data]
                    var2 = [np.var(da) for da in lab]
                    merge_fields = fields[0] + fields[1] if fields[1] else fields[0]
                    x_domain = merge_fields + ["_empty"] + lab_fields
                    y_domain = var1 + [0] + var2

                    temp = var1[:-1] if flag else var1
                    json = {
                        "table1": {"X_fields": fields[0],
                                   "Y_fields": fields[1],
                                   "data": [dict(zip(merge_fields, arr)) for arr in list(zip(*data))]
                                   },
                        "table2": {"data": [dict(zip(lab_fields, arr)) for arr in labels],
                                   "fields": lab_fields},
                        "bar": {"x_domain": x_domain,
                                "y_domain": y_domain},
                        "pie1": [{"text": fields[0][i], "value": temp[i]} for i in range(len(temp))],
                        "pie2": [{"text": lab_fields[i], "value": var2[i]} for i in range(len(var2))],
                        "general_info": gen_info,
                        "category": toolkit_obj.category}

            else:
                json = {}

            # update a job
            job_business.end_job(job_obj)

            if result_spec["if_reserved"]:
                # create result sds for toolkit
                sds_name = '%s_%s_result' % (toolkit_obj['name'], job_obj['id'])
                result_sds_obj = staging_data_set_business.add(sds_name, 'des',
                                                               project_obj,
                                                               job=job_obj,
                                                               type='result')
                logger_service.save_result(result_sds_obj, **{"result": results})
                logger_service.save_result(result_sds_obj, **{"visualization": json})
                return {"visual_sds_id": str(result_sds_obj.id) if json else None,
                        "result": results}

            return {"result": results}
        return wrapper
    return decorator


def create_model_job(project_id, staging_data_set_id, model_obj, **kwargs):
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
            params = args[0]
            file_id = kwargs.get('file_id')
            staging_data_set_obj = None
            if staging_data_set_id:
                staging_data_set_obj = \
                    staging_data_set_business.get_by_id(staging_data_set_id)
            project_obj = project_business.get_by_id(project_id)

            file_dict = {'file': ObjectId(file_id)} if file_id else {}

            # create model job
            job_obj = job_business.add_model_job(model_obj,
                                                 staging_data_set_obj,
                                                 project_obj,
                                                 params=params,
                                                 **file_dict)
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
            job_business.end_job(job_obj)

            # create a result
            # result_obj = result_business.add_result(func_result, job_obj, 0, "")

            return func_result
        return wrapper
    return decorator


def get_job_from_result(result_obj):
    return result_business.get_result_by_id(result_obj['id']).job


def split_supervised_input(staging_data_set_id, x_fields, y_fields, schema,
                           **kwargs):
    obj = staging_data_service.split_x_y(staging_data_set_id, x_fields,
                                         y_fields)
    return staging_data_service.split_test_train(obj, schema=schema, **kwargs)


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


def run_code(conf, project_id, staging_data_set_id, model, f, *args, **kwargs):
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
    func = create_model_job(project_id, staging_data_set_id, model, **kwargs)(f)
    # run model with decorator
    return func(conf, *args)


def list_by_project_id(project_id):
    project = project_business.get_by_id(project_id)
    return job_business.get_by_project(project)


def add_new_column(value, index, name, staging_data_set_id):
    inn = 0
    while inn in index:
        inn = inn + 1
    if not isinstance(value[inn], list):
        staging_data_service.add_new_key_value(staging_data_set_id, name, value)
    else:
        length = len(value[inn])
        name_list = []
        col_value = []
        for i in range(length):
             name_list.append(name + str(i))
        for arr in value:
            if arr != arr:
                rows = [arr]*length
                obj = dict(zip(name_list, rows))
            else:
                obj = dict(zip(name_list, arr))
            col_value.append(obj)
        staging_data_service.add_new_keys_value(staging_data_set_id, col_value)


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
    #                               '11', '11', '11', '11', '11', '11',
    #                               '11', '11', '11', '11', '11', '11',
    #                               '11', '11', '11', '11', '11', '11',
    #                               '11', '11', '11', '11', '11', '11',
    #                               '11', '11', '11', '11', '11', '11',
    #                               '11', '11', '11', '11', '11', '11'],
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