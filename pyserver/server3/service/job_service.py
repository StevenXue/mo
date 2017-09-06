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
from server3.service import staging_data_service, logger_service, \
     visualization_service
from server3.business import ownership_business
from server3.utility import data_utility
from server3.lib import models
from server3.repository import config
from server3.utility import json_utility
from server3.utility import data_utility

user_directory = config.get_file_prop('UPLOAD_FOLDER')


def create_toolkit_job(project_id, staging_data_set_id, toolkit_obj, fields, nan_index):
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
            result = list(func_rst) if isinstance(func_rst, tuple) else [func_rst]

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
                        staging_data_service.update_many_with_new_fields(value, nan_index, fields[0],
                                                                         str_name, staging_data_set_id)
                    except (TypeError, ValueError) as e:
                        print("ERRORS in data saved to database")

                if arg.get("attribute", False) and arg["attribute"] == "label":
                    labels = value
                elif arg.get("attribute", False) and arg["attribute"] == "general_info":
                    gen_info.append({arg["name"]: {"value": value, "description": arg["des"]}})

            # 可视化计算
            # 聚类分析
            if toolkit_obj.category == 0:
                json = {"scatter": data_utility.retrieve_nan_index(args[0], nan_index),
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
                target = args[1]

                json = {"Y_target": fields[1],
                        "X_fields": fields[0],
                        "labels": labels,
                        "bar": results["scores"],
                        "general_info": {"Selected Features": "%s out of %s" % (
                            len(list(filter(lambda x: x is True, labels))),
                            len(fields[0])),
                                         "Selected Fields": " ".join(
                                             str(el) for el in
                                             list(compress(fields[0], labels))),
                                         "Number of NaN": len(args[2])},
                        "scatter": {"y_domain": target,
                                    "x_domain": data,
                                    "pearsonr": [pearsonr(el, target)[0] for el
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

                result_be = labels if flag_shape else np.array(labels).reshape([-1, 1]).tolist()

                data = list(zip(*args[0]))
                result = list(zip(*result_be))

                # 曾经两表合并，现在不需要了
                # merge_data = list(zip(*(data + result)))
                if len(result) == len(fields[0]):
                    lab_fields = [str(fields[0][i]) + "_New_Col" for i in range(len(result))]
                else:
                    lab_fields = [str(fields[0][0]) + "_New_Col_" + str(i) for i in range(len(result))]

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
                            "data": [dict(zip(fields[0], arr)) for arr in args[0]]
                        },
                        "table2": {
                            "title": "转换后数据",
                            "field": lab_fields,
                            "data": [dict(zip(lab_fields, arr)) for arr in result_be]
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
                sds_name = '%s_%s_result' % (toolkit_obj['name'], job_obj['id'])
                result_sds_obj = staging_data_set_business.add(sds_name, 'des',
                                                               project_obj,
                                                               job=job_obj,
                                                               type='result')
                logger_service.save_result(result_sds_obj, **{"result": json_utility.convert_to_json(results)})
                logger_service.save_result(result_sds_obj, **{"visualization": json})
                return {
                    "visual_sds_id": str(result_sds_obj.id) if json else None,
                    "result": results}

            return {"result": results}

        return wrapper

    return decorator


def create_model_job(project_id, staging_data_set_id, model_obj, **kwargs):
    """
    help model to create a job before model runs,
    as well as save the job & create a result after model runs
    :param project_id:
    :param staging_data_set_id:
    :param model_obj:
    :return:
    """

    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kw):
            # create a job
            # model_obj = model_business.get_by_model_id(model_id)
            params = args[0]
            file_id = kwargs.get('file_id')
            result_dir = kwargs.get('result_dir')
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
            project_business.insert_job_by_id(project_id, job_obj.id)
            project_business.update_items_to_list_field(
                project_id, related_tasks=model_obj.category)
            # create result sds for model
            sds_name = '%s_%s_result' % (model_obj['name'], job_obj['id'])
            result_sds_obj = staging_data_set_business.add(sds_name, 'des',
                                                           project_obj,
                                                           job=job_obj,
                                                           type='result')
            # run
            if result_dir:
                result_dir += str(job_obj['id']) + '/'
                os.makedirs(result_dir)
                kw['result_dir'] = result_dir
            func_result = func(*args, **kw, result_sds=result_sds_obj,
                               project_id=project_id)
            # update a job
            job_business.end_job(job_obj)
            if isinstance(func_result, dict):
                func_result['job_id'] = str(job_obj['id'])

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
        staging_data_service.add_new_key_value(staging_data_set_id, name, value)
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


if __name__ == '__main__':
    pass
