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
import os
import random
import shutil
from subprocess import call

import functools
import os
from itertools import compress

import numpy as np
from bson import ObjectId
from mongoengine import DoesNotExist

from server3.business import job_business
from server3.business import model_business
from server3.business import project_business
from server3.business.project_business import ProjectBusiness
from server3.business import result_business
from server3.business import staging_data_business
from server3.business import staging_data_set_business
from server3.business import toolkit_business
from server3.business.step_business import StepBusiness

from server3.repository import config
from server3.service import model_service
from server3.service import staging_data_service, logger_service, \
    visualization_service
from server3.service import toolkit_service
from server3.utility import data_utility
from server3.utility import json_utility
from server3.entity.model import TYPE
from server3.constants import MODULE_DIR

TYPE = {list(v)[0]: list(v)[1] for v in list(TYPE)}
user_directory = config.get_file_prop('UPLOAD_FOLDER')


# def create_job(project_id, toolkit_id, model_id):
#     if toolkit_id:
#         # create a job
#         toolkit_obj = toolkit_business.get_by_toolkit_id(toolkit_id)
#         project_obj = project_business.get_by_id(project_id)
#         job_obj = job_business.add_toolkit_job(
#             toolkit_obj=toolkit_obj,
#             model_obj=None,
#             staging_data_set_obj=None,
#             project_obj=project_obj,
#         )
#     else:
#         # create a job
#         model_obj = model_business.get_by_model_id(model_id)
#         project_obj = project_business.get_by_id(project_id)
#         job_obj = job_business.add_toolkit_job(
#             model_obj=model_obj,
#             toolkit_obj=None,
#             staging_data_set_obj=None,
#             project_obj=project_obj,
#         )
#     # update a project
#     project_business.insert_job_by_id(project_id, job_obj.id)
#     return job_obj

def create_job(project_id, script_path):
    working_path = ProjectBusiness.get_by_id(project_id).path
    print(working_path, script_path)


def create_toolkit_job(project_id, staging_data_set_id, toolkit_obj, fields,
                       nan_index):
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

            # create a job
            staging_data_set_obj = staging_data_set_business.get_by_id(
                staging_data_set_id)
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
            project_business.insert_job_by_id(project_id, job_obj.id)

            # calculate
            func_rst = func(*args, **kw)
            result = list(func_rst) if isinstance(func_rst, tuple) else [
                func_rst]

            # 新设计的存取方式
            results = {
                "fields": {
                    "source": fields[0],
                    "target": fields[1]}
            }
            gen_info = []
            result_spec = toolkit_obj.result_spec

            for arg in result_spec["args"]:
                value = result.pop(0)
                results.update({arg["name"]: value})
                if arg["if_add_column"]:
                    # 不能使用中文名
                    str_name = "%s_col" % toolkit_obj.entry_function
                    value = data_utility.retrieve_nan_index(value, nan_index)
                    try:
                        staging_data_service.update_many_with_new_fields(value,
                                                                         nan_index,
                                                                         fields[
                                                                             0],
                                                                         str_name,
                                                                         staging_data_set_id)
                    except (TypeError, ValueError) as e:
                        print("ERRORS in data saved to database")

                if arg.get("attribute", False) and arg["attribute"] == "label":
                    labels = value
                elif arg.get("attribute", False) and arg[
                    "attribute"] == "general_info":
                    gen_info.append({arg["name"]: {"value": value,
                                                   "description": arg["des"]}})

            # 可视化计算
            # 聚类分析
            if toolkit_obj.category == 0:
                json = {"scatter": data_utility.retrieve_nan_index(args[0],
                                                                   nan_index),
                        "labels": labels,
                        "pie": [{'name': el, 'value': labels.count(el)} for el
                                in set(labels)],
                        "centers": results["Centroids of Clusters"],
                        "general_info": gen_info,
                        "fields": fields[0],
                        "category": toolkit_obj.category}

            # 特征选取
            elif toolkit_obj.category == 1:
                from scipy.stats import pearsonr
                # from minepy import MINE
                data = list(zip(*args[0]))
                target_flag = 1 if len(args) == 2 else 0
                target = args[1] if target_flag else None

                json = {"Y_target": fields[1],
                        "X_fields": fields[0],
                        "labels": labels,
                        "bar": results["scores"],
                        "general_info": {
                            "Selected Features": "%s out of %s" % (
                                len(list(filter(lambda x: x is True, labels))),
                                len(fields[0])),
                            "Selected Fields": " ".join(
                                str(el) for el in
                                list(compress(fields[0], labels))),
                            "Number of NaN": len(nan_index)},
                        "scatter": {"y_domain": target,
                                    "x_domain": data,
                                    "pearsonr": [pearsonr(el, target)[0] if
                                                 target_flag else None for el
                                                 in data],
                                    # "mic": [MINE(alpha=0.6, c=15, est="mic_approx").compute_score(el,
                                    # list(data[0]).mic()) for el in list(data[1:])]}
                                    "mic": [None for el in data]},
                        "category": toolkit_obj.category}

            # 数值转换
            elif toolkit_obj.category == 2:
                inn = 0
                while inn in nan_index:
                    inn = inn + 1
                # 由于出来的数据格式不一致，判断是否为二维数据(是=>1, 不是=>0)
                flag_shape = 1 if isinstance(labels[inn], list) else 0

                result_be = labels if flag_shape else np.array(labels).reshape(
                    [-1, 1]).tolist()

                data = list(zip(*args[0]))
                result = list(zip(*result_be))

                # 曾经两表合并，现在不需要了
                # merge_data = list(zip(*(data + result)))
                if len(result) == len(fields[0]):
                    lab_fields = [str(fields[0][i]) + "_New_Col" for i in
                                  range(len(result))]
                else:
                    lab_fields = [str(fields[0][0]) + "_New_Col_" + str(i) for
                                  i in range(len(result))]

                # merge_fields = fields[0] + lab_fields

                flag_str1 = isinstance(args[0][inn][0], str)
                flag_str2 = isinstance(result_be[inn][0], str)
                bar1 = []
                bar2 = []
                for el in fields[0]:
                    indx = fields[0].index(el)
                    raw_d = data[indx]

                    if not flag_str1 and len(set(raw_d)) > 5:
                        bar1_tmp = visualization_service.freq_hist(raw_d)
                    else:
                        seta = set(raw_d)
                        x_domain = [el for el in seta]
                        y_domain = [raw_d.count(el) for el in seta]
                        bar1_tmp = {'x_domain': x_domain, 'y_domain': y_domain}
                    bar1_tmp.update({"field": el, "title": "数据分布直方图(栏位转换前)"})
                    bar1.append(bar1_tmp)

                for el in lab_fields:
                    indx = lab_fields.index(el)
                    raw_re = result[indx]

                    if not flag_str2 and len(set(raw_re)) > 5:
                        bar2_tmp = visualization_service.freq_hist(raw_re)
                    else:
                        seta = set(raw_re)
                        x_domain = [el for el in seta]
                        y_domain = [raw_re.count(el) for el in seta]
                        bar2_tmp = {'x_domain': x_domain, 'y_domain': y_domain}
                    bar2_tmp.update({"field": el, "title": "数据分布直方图(栏位转换后)"})
                    bar2.append(bar2_tmp)

                json = {"category": toolkit_obj.category,
                        "table1": {
                            "title": "原始数据",
                            "field": fields[0],
                            "data": [dict(zip(fields[0], arr)) for arr in
                                     args[0]]
                        },
                        "table2": {
                            "title": "转换后数据",
                            "field": lab_fields,
                            "data": [dict(zip(lab_fields, arr)) for arr in
                                     result_be]
                        },
                        "bar1": bar1,
                        "bar2": bar2}

            # 降维
            elif toolkit_obj.category == 3:
                flag = toolkit_obj.parameter_spec["data"]["type"][
                           "key"] == "transfer_box"
                data = list(zip(*args[0]))

                if flag:
                    data.append(args[1])
                lab = list(zip(*labels))
                lab_fields = ["New Col" + str(i) for i in range(len(lab))]
                var1 = [np.var(da) for da in data]
                var2 = [np.var(da) for da in lab]
                merge_fields = fields[0] + fields[1] if fields[1] else \
                    fields[0]
                x_domain = merge_fields + ["_empty"] + lab_fields
                y_domain = var1 + [0] + var2

                temp = var1[:-1] if flag else var1
                json = {
                    "table1": {"X_fields": fields[0],
                               "Y_fields": fields[1],
                               "data": [dict(zip(merge_fields, arr)) for arr
                                        in list(zip(*data))]
                               },
                    "table2": {
                        "data": [dict(zip(lab_fields, arr)) for arr in
                                 labels],
                        "fields": lab_fields},
                    "bar": {"x_domain": x_domain,
                            "y_domain": y_domain},
                    "pie1": [{"name": fields[0][i], "value": temp[i]} for i
                             in range(len(temp))],
                    "pie2": [{"name": lab_fields[i], "value": var2[i]} for i
                             in range(len(var2))],
                    "general_info": gen_info,
                    "category": toolkit_obj.category}

            else:
                json = {}

            # update a job
            job_business.end_job(job_obj)

            if result_spec["if_reserved"]:
                # create result sds for toolkit
                sds_name = '%s_%s_result' % (
                    toolkit_obj['name'], job_obj['id'])
                result_sds_obj = staging_data_set_business.add(sds_name, 'des',
                                                               project_obj,
                                                               job=job_obj,
                                                               type='result')
                logger_service.save_result(result_sds_obj, **{
                    "result": json_utility.convert_to_json(results)})
                logger_service.save_result(result_sds_obj,
                                           **{"visualization": json})
                return {
                    "visual_sds_id": str(result_sds_obj.id) if json else None,
                    "result": results}

            return {"result": results}

        return wrapper

    return decorator


def create_model_job(project_id, staging_data_set_id, model_obj,
                     job_id, **kwargs):
    """
    help model to create a job before model runs,
    as well as save the job & create a result after model runs
    :param project_id:
    :param staging_data_set_id:
    :param model_obj:
    :param job_id:
    :return:
    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kw):
            # create a job
            # model_obj = model_business.get_by_model_id(model_id)
            result_dir = kwargs.get('result_dir')

            project_obj = project_business.get_by_id(project_id)

            job_obj = job_business.get_by_job_id(job_id)

            # update a project
            project_business.insert_job_by_id(project_id, job_obj.id)
            project_business.update_items_to_list_field(
                project_id, related_tasks=TYPE.get(model_obj.category, []))
            # create result sds for model
            sds_name = '%s_%s_result' % (model_obj['name'], job_obj['id'])
            try:
                sds = staging_data_set_business.get_by_job_id(job_obj.id)
            except DoesNotExist:
                print('free to create sds')
            else:
                staging_data_set_business.remove_by_id(sds.id)
            finally:
                result_sds_obj = staging_data_set_business.add(sds_name, 'des',
                                                               project_obj,
                                                               job=job_obj,
                                                               type='result')

            # run
            if result_dir:
                # result_dir += str(job_obj['id']) + '/'
                try:
                    os.makedirs(result_dir)
                except FileExistsError:
                    print('dir exists, no need to create')
                kw['result_dir'] = result_dir

            # generate_job_py(func, *args, **kw, result_sds=result_sds_obj,
            #                 project_id=project_id)

            func_result = func(*args, **kw, result_sds=result_sds_obj,
                               project_id=project_id, job_id=job_id)
            # update a job
            job_business.end_job(job_obj)
            if isinstance(func_result, dict):
                func_result['job_id'] = str(job_obj['id'])

            return func_result

        return wrapper

    return decorator


def get_job_from_result(result_obj):
    return result_business.get_result_by_id(result_obj['id']).job


def run_code(conf, project_id, staging_data_set_id, model, f, job_id, *args,
             **kwargs):
    """
    run supervised learning code
    :param conf:
    :param project_id:
    :param staging_data_set_id:
    :param model:
    :param f:
    :param job_id:
    :return:
    """
    # add decorator
    func = create_model_job(project_id, staging_data_set_id, model, job_id,
                            **kwargs)(f)
    # run model with decorator
    # from run import socketio
    # thread = socketio.start_background_task(func, conf, *args)
    # print(thread)
    # return 1
    return func(conf, *args)


def list_by_project_id(project_id):
    project = project_business.get_by_id(project_id)
    return job_business.get_by_project(project)


def add_new_column(value, index, fields, name, staging_data_set_id):
    inn = 0
    while inn in index:
        inn = inn + 1
    if not isinstance(value[inn], list):
        staging_data_service.add_new_key_value(staging_data_set_id, name,
                                               value)
    else:
        length = len(value[inn])
        name_list = []
        col_value = []
        for i in range(length):
            name_list.append(name + str(i))
        for arr in value:
            if arr != arr:
                rows = [arr] * length
                obj = dict(zip(name_list, rows))
            else:
                obj = dict(zip(name_list, arr))
            col_value.append(obj)
        staging_data_service.add_new_keys_value(staging_data_set_id, col_value)


def toolkit_steps_to_obj(job_obj, project_id):
    new_args = {}
    if len(job_obj.steps) > 2:
        args = StepBusiness.get_parameters_step(job_obj.steps).get('args')
        # args = job_obj.steps[2].get("args")
        for arg in args:
            new_args[arg['name']] = arg['value'] if arg['value'] else arg[
                'default']

    if StepBusiness.check_fields(job_obj.steps):
        data_fields = StepBusiness.get_fields(job_obj.steps)
    else:
        data_fields = [StepBusiness.get_feature_fields(job_obj.steps),
                       StepBusiness.get_label_fields(job_obj.steps)]

    obj = {
        "staging_data_set_id": job_obj.steps[0]["args"][0]["value"],
        "conf": {
            "args": new_args,
            "data_fields": data_fields,
            # ["HighAlpha", "Attention_dimension_reduction_PCA_col"]
            #     job_obj.steps[1]["args"][0]["values"],
        },
        "project_id": project_id,
        "toolkit_id": job_obj.toolkit.id,
    }
    return obj


def model_steps_to_obj(job_obj, project_id):
    """
    convert model steps config to running object
    :param job_obj:
    :param project_id:
    :return:
    """
    model_obj = job_obj.model
    steps = job_obj.steps

    conf = {}
    fit_idx = None
    layers_idx = None
    est_idx = None
    comp_idx = None
    hyper_idx = None

    for i, step in enumerate(steps):
        if step.get('name') == 'fit':
            fit_idx = i
        if step.get('name') == 'layers':
            layers_idx = i
        if step.get('name') == 'estimator':
            est_idx = i
        if step.get('name') == 'compile':
            comp_idx = i
        if step.get('name') == 'hyperparameters':
            hyper_idx = i

    if not fit_idx:
        raise Exception('Error: no fit step')

    for step in steps[fit_idx:]:
        conf.update({step.get('name'): get_args(step['args'])})

    if model_obj.category == 0:

        conf['fit'].update({
            "data_fields":
                [steps[1]["args"][0]["values"],
                 steps[2]["args"][0]["values"]]
        })
        if comp_idx:
            conf['compile'] = get_args(steps[comp_idx]['args'])
        if layers_idx:
            conf['layers'] = [{
                'name': layer.get('name'),
                **get_args(layer.get('args'))}
                for layer in steps[layers_idx]['args'][0]['values']]

    elif model_obj.category == 1:

        conf['fit'].update({
            "data_fields":
                [steps[1]["args"][0]["values"],
                 steps[2]["args"][0]["values"]]
        })
        if est_idx:
            conf['estimator'] = get_args(steps[est_idx]['args'])

    elif model_obj.category == 2:
        conf['fit'].update({
            "data_fields": steps[1]["args"][0]["values"]
        })
        if est_idx:
            conf['estimator'] = {'args': get_args(steps[est_idx]['args'])}

    elif model_obj.category == 7:
        conf['fit'].update({
            "data_fields":
                [steps[1]["args"][0]["values"],
                 steps[2]["args"][0]["values"]]
        })
        if est_idx:
            conf['estimator'] = get_args(steps[est_idx]['args'])

        conf['hyperparameters'] = get_args(steps[hyper_idx]['args'])

    print("job_obj.steps", job_obj.steps)
    obj = {
        "data_source_id": job_obj.steps[0]["args"][0]["value"],
        "conf": conf,
        "project_id": project_id,
        "model_id": model_obj.id,
        "schema": "rand",
        "ratio": 0.7
    }
    print('modelling obj', obj)
    return obj


def run_toolkit_job_pro(job_obj, project_id):
    from server3.lib import toolkit_orig
    from server3.lib import preprocess_orig
    # 将job的step直接传给对应的toolkit
    toolkit_obj = job_obj.toolkit
    if hasattr(toolkit_orig, toolkit_obj.entry_function):
        func = getattr(toolkit_orig, toolkit_obj.entry_function)
    else:
        func = getattr(preprocess_orig, toolkit_obj.entry_function)
    func_rst = func(steps=job_obj.steps)
    return func_rst


def get_args(args):
    return {'args':
                {arg.get('name'): arg.get('value')
                                  or arg.get('values')
                                  or arg.get('default')
                 for arg in args}
            }


def run_toolkit_job(job_obj, project_id):
    if job_obj.toolkit.category == -1:
        result = run_toolkit_job_pro(job_obj, project_id)
        # save result to job

        job_obj.result = result
        job_obj.save()
        return {
            "result": result,
            "result_sds_obj": None,
        }

    data = toolkit_steps_to_obj(job_obj, project_id)

    staging_data_set_id = data.get('staging_data_set_id')
    toolkit_id = data.get('toolkit_id')
    project_id = data.get('project_id')
    conf = data.get('conf')
    # conf初步操作
    flag = isinstance(conf["data_fields"][0], (list, tuple))

    # 是否可以替代 0位是什么，什么时候出现
    if flag:
        fields = conf["data_fields"][0] + conf["data_fields"][1]
    else:
        fields = conf["data_fields"]  # 数组

    x_fields = conf["data_fields"][0] if flag else conf["data_fields"]
    y_fields = conf["data_fields"][1] if flag else None
    fields = x_fields + y_fields if flag else x_fields
    data = staging_data_business.get_by_staging_data_set_and_fields(
        ObjectId(staging_data_set_id), fields)

    # 数据库转to_mongo和to_dict
    data = [d.to_mongo().to_dict() for d in data]

    # 拿到conf
    fields = [x_fields, y_fields]
    conf = conf.get('args')

    result = toolkit_service.run_toolkit(project_id, staging_data_set_id,
                                         toolkit_id,
                                         fields, data, conf, job_obj)
    result.update({"fields": [x_fields, y_fields]})
    return result


def run_model_job(job_obj, project_id):
    obj = model_steps_to_obj(job_obj, project_id)
    return model_service.kube_run_model(job_obj=job_obj, **obj)


def model_job_to_code(job_obj, project_id):
    obj = model_steps_to_obj(job_obj, project_id)
    return model_service.model_to_code(job_obj=job_obj, **obj)


# def run_job(obj, job_obj):
#     if obj.get('model_id'):
#         return model_service.kube_run_model(job_obj=job_obj, **obj)
#     else:
#         data = obj
#         staging_data_set_id = data.get('staging_data_set_id')
#         toolkit_id = data.get('toolkit_id')
#         project_id = data.get('project_id')
#         conf = data.get('conf')
#
#         # conf初步操作
#         flag = isinstance(conf["data_fields"][0], (list, tuple))
#         x_fields = conf["data_fields"][0] if flag else conf["data_fields"]
#         y_fields = conf["data_fields"][1] if flag else None
#         fields = x_fields + y_fields if flag else x_fields
#         data = staging_data_business.get_by_staging_data_set_and_fields(
#             ObjectId(staging_data_set_id), fields)
#
#         # 数据库转to_mongo和to_dict
#         data = [d.to_mongo().to_dict() for d in data]
#
#         # 拿到conf
#         fields = [x_fields, y_fields]
#         conf = conf.get('args')
#
#         result = toolkit_service.run_toolkit(project_id, staging_data_set_id,
#                                              toolkit_id,
#                                              fields, data, conf, job_obj)
#         result.update({"fields": [x_fields, y_fields]})
#         return result


def save_result(job_id):
    job_obj = job_business.get_by_job_id(job_id)
    result = job_obj.result
    toolkit = job_obj.toolkit

    sds_id = StepBusiness.get_datasource(job_obj.steps)
    save_result_sub(result, sds_id, toolkit)


def save_as_result(job_id, new_sds_name):
    job_obj = job_business.get_by_job_id(job_id)
    result = job_obj.result
    toolkit = job_obj.toolkit
    project_obj = job_obj.project

    sds_id = staging_data_set_business.add(
        name=new_sds_name,
        description='des',
        project=project_obj,
        # job=job_obj
    )

    # 拿到原表
    old_sds = StepBusiness.get_datasource(job_obj.steps)
    table = staging_data_business.get_by_staging_data_set_id(old_sds)

    table_dict = []
    for i in range(len(table)):
        row = table[i].to_mongo().to_dict()
        row.pop("_id")
        row.pop("staging_data_set")
        table_dict.append(row)

    # 复制原表
    staging_data_business.add_many(
        staging_data_set=sds_id,
        data_array=table_dict
    )

    # 保存结果
    save_result_sub(result, sds_id, toolkit)


def save_result_sub(result, sds_id, toolkit_obj):
    """

    :param result: job result
    :type result: json object
    :param sds_id: staging_data_set id
    :type sds_id: ObjectId
    :param sds_id: toolkit_obj
    :type sds_id: toolkit obj
    :return: true or false
    :rtype:
    """
    # 获取 update_many_with_new_fields 需要的东西
    result_spec = toolkit_obj.result_spec
    field = result['fields']["source"]
    target_field = result['fields']["target"]
    fields = [field, target_field]
    index_nan = []

    # 从result中选取要存的列
    for arg in result_spec["args"]:
        if arg["if_add_column"]:
            # 不能使用中文名
            str_name = "%s_col" % toolkit_obj.entry_function
            # 获取列值
            value = result[arg['name']]
            value = data_utility.retrieve_nan_index(value, index_nan)
            try:
                staging_data_service.update_many_with_new_fields(
                    raw_data=value,
                    index=index_nan,
                    fields=fields,
                    name=str_name,
                    sds_id=sds_id,
                )
            except (TypeError, ValueError) as e:
                print("ERRORS in data saved to database")



# def get_index_nan(fields, staging_data_set_id):
#     """
#
#     :param fields:
#     :type fields: 数据栏位 [x, y]
#     :param staging_data_set_id: 数据源
#     :type staging_data_set_id:
#     :return:
#     :rtype:
#     """
#     data = staging_data_business.get_by_staging_data_set_and_fields(
#         ObjectId(staging_data_set_id), fields)
#     col1, col2 = fields
#     columns = col1 + col2 if col2 is not None else col1
#     # 去除NaN
#     index_nan = []
#     arg_filter = []
#     # print("data", data)
#     # print("fields", fields)
#     for index, item in enumerate(data):
#         temp = [data_utility.convert_string_to_number_with_poss(item[i]) for i
#                 in columns]
#         if np.nan not in temp:
#             arg_filter.append(temp)
#         else:
#             index_nan.append(index)
#     return index_nan


if __name__ == '__main__':
    # save_result('59fbddb7d845c05927560783')
    save_as_result('59fbddb7d845c05927560783', 'test12345')
    pass
