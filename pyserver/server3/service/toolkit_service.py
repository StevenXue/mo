#!/usr/bin/python
# -*- coding: UTF-8 -*-
'''
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 11:00pm
# @function : Getting all of the toolkit of statics analysis
# @running  : python
# Further to FIXME of None
'''
import functools
from itertools import compress

from bson import ObjectId
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from minepy import MINE
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE


from server3.lib import toolkit_orig
from server3.lib import preprocess_orig
from server3.service import job_service, staging_data_service, visualization_service, logger_service
from server3.business import toolkit_business, ownership_business, \
    user_business, job_business, \
    result_business, project_business, staging_data_set_business
from server3.utility import data_utility, json_utility
# from server3.business import ownership_business
import copy

TOOLKIT_CATEGORY_DICT = {
    0: '聚类',
    1: '特征选取',
    2: '数值转换',
    3: '降维',
    4: '概率统计推断'
}

NEW_TOOLKIT_CATEGORY = [
    {
        'name': 'simple_toolkit',
        'zh_name': '简单的toolkit',
        'us_name': 'Simple Toolkit',
        'child': [
            '简单的K平均数算法',
        ],
        'children': []
    },
    {
        'name': 'data_explore',
        'zh_name': '初探数据集',
        'us_name': 'Data Explore',
        'child': [
            'K平均数算法',
            '移动平均值',
            '皮尔森相关系数',
            '变异系数',
            '数据互相关'
        ],
        'children': []
    },
    {
        'name': 'data_quality_improve',
        'zh_name': '提升数据质量',
        'us_name': 'Data Quality Improve',
        'child': [
            '归一化',
        ],
        'children': []
    },
    {
        'name': 'feature_selection',
        'zh_name': '特征提取',
        'us_name': 'Feature Selection',
        'child': [
            '方差选择法',
            '卡方选择法',
            '相关系数选择法',
            '互信息选择法',
            '递归特征消除法'
        ],
        'children': []
    }
]


def get_all_public_toolkit_by_new_category():
    toolkit_category = copy.deepcopy(NEW_TOOLKIT_CATEGORY)
    for obj in ownership_business.list_ownership_by_type_and_private('toolkit',
                                                                     False):
        toolkit_obj = obj.toolkit.to_mongo()
        toolkit_obj.pop("target_py_code")
        for idx, category in enumerate(NEW_TOOLKIT_CATEGORY):
            for name in category['child']:
                if toolkit_obj['name'] == name:
                    toolkit_category[idx]['children'].append(toolkit_obj)
                    break

    return toolkit_category


def get_all_public_toolkit():
    list_toolkit = []
    for obj in ownership_business.list_ownership_by_type_and_private('toolkit',
                                                                     False):
        list_toolkit.append(obj.toolkit.to_mongo().to_dict())
    return list_toolkit


def get_all_public_toolkit_by_category():
    toolkit_category_dict = {}
    for obj in ownership_business.list_ownership_by_type_and_private('toolkit',
                                                                     False):
        if obj.toolkit.category in TOOLKIT_CATEGORY_DICT:
            string = TOOLKIT_CATEGORY_DICT[obj.toolkit.category]
            toolkit_obj = obj.toolkit.to_mongo()
            toolkit_obj.pop("target_py_code")
            if string in toolkit_category_dict:
                toolkit_category_dict[string].append(toolkit_obj)
            else:
                toolkit_category_dict[string] = [toolkit_obj]
    return toolkit_category_dict


def list_public_toolkit_name():
    all_names = []
    for tool in get_all_public_toolkit():
        all_names.append(tool.toolkit.name)
    return all_names


def toolkit_calculate_temp(project_id, staging_data_set_id, toolkit_id, fields,
                           *argv):
    toolkit_obj = toolkit_business.get_by_toolkit_id(toolkit_id)
    entry_function = toolkit_obj.entry_function
    code = "from lib.toolkit_orig import " + entry_function
    exec(code)
    func = locals()[toolkit_obj.entry_function]
    func = job_service.create_toolkit_job(project_id, staging_data_set_id,
                                          toolkit_id, fields)(func)
    result = func(*argv)
    return result


# for database 调用toolkit code tag for zhaofeng
def toolkit_calculate(project_id, staging_data_set_id, toolkit_obj,
                      fields, nan_index, *argv, **kwargs):
    if hasattr(toolkit_orig, toolkit_obj.entry_function):
        func = getattr(toolkit_orig, toolkit_obj.entry_function)
    else:
        func = getattr(preprocess_orig, toolkit_obj.entry_function)

    func = job_service.create_toolkit_job(project_id, staging_data_set_id,
                                          toolkit_obj, fields, nan_index)(func)
    result = func(*argv, **kwargs)

    return result


# same as toolkit_calculate
def run_toolkit_sub(project_id, staging_data_set_id, toolkit_obj,
                    fields, nan_index, job_obj, *argv, **kwargs):
    if hasattr(toolkit_orig, toolkit_obj.entry_function):
        func = getattr(toolkit_orig, toolkit_obj.entry_function)
    else:
        func = getattr(preprocess_orig, toolkit_obj.entry_function)
    # run toolkit
    func_rst = func(*argv, **kwargs)
    result = after_run_toolkit(project_id, staging_data_set_id,
                               toolkit_obj, fields, nan_index,
                               func_rst, job_obj,
                               *argv, **kwargs)
    # save visual_sds_id to job
    job_obj.visual_sds_id = result.pop("result_sds_obj")
    job_obj.save()
    return result


def after_run_toolkit(project_id, staging_data_set_id,
                      toolkit_obj, fields, nan_index, func_rst, job_obj, *args, **kwargs):
    project_obj = project_business.get_by_id(project_id)
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
        result_sds_obj = staging_data_set_business.get_or_create(job_obj, sds_name, 'des',
                                                                 project_obj,
                                                                 job=job_obj,
                                                                 type='result')

        # result_sds_obj = staging_data_set_business.add(sds_name, 'des',
        #                                                project_obj,
        #                                                job=job_obj,
        #                                                type='result')
        logger_service.save_result(result_sds_obj, **{
            "result": json_utility.convert_to_json(results)})
        logger_service.save_result(result_sds_obj,
                                   **{"visualization": json})
        return {
            "visual_sds_id": str(result_sds_obj.id) if json else None,
            "result": results,
            "result_sds_obj": result_sds_obj
        }

    return {"result": results}



def convert_json_and_calculate(project_id, staging_data_set_id, toolkit_id,
                               fields, data, kwargs):
    """convert json list"""
    col1, col2 = fields
    columns = col1 + col2 if col2 is not None else col1
    # 去除NaN
    index_nan = []
    arg_filter = []
    print("data", data)
    print("fields", fields)
    for index, item in enumerate(data):
        temp = [data_utility.convert_string_to_number_with_poss(item[i]) for i
                in columns]
        if np.nan not in temp:
            arg_filter.append(temp)
        else:
            index_nan.append(index)

    argv_after = list(zip(*arg_filter))

    # 准备input
    argv = [list(zip(*argv_after[:len(col1)]))]
    if col2 is not None:
        argv.append(argv_after[len(col1):][0])

    toolkit_obj = toolkit_business.get_by_toolkit_id(toolkit_id)

    # toolkit_temp应该支持数据库接入
    if kwargs:
        result = toolkit_calculate(project_id, staging_data_set_id,
                                   toolkit_obj, fields, index_nan,
                                   *argv, **kwargs)
    else:
        result = toolkit_calculate(project_id, staging_data_set_id,
                                   toolkit_obj, fields, index_nan,
                                   *argv)
    return result


def run_toolkit(project_id, staging_data_set_id, toolkit_id,
                fields, data, conf, job_obj):
    """convert json list"""
    col1, col2 = fields
    columns = col1 + col2 if col2 is not None else col1
    # 去除NaN
    index_nan = []
    arg_filter = []
    print("data", data)
    print("fields", fields)
    for index, item in enumerate(data):
        temp = [data_utility.convert_string_to_number_with_poss(item[i]) for i
                in columns]
        if np.nan not in temp:
            arg_filter.append(temp)
        else:
            index_nan.append(index)

    argv_after = list(zip(*arg_filter))

    # 准备input
    argv = [list(zip(*argv_after[:len(col1)]))]
    if col2 is not None:
        argv.append(argv_after[len(col1):][0])

    toolkit_obj = toolkit_business.get_by_toolkit_id(toolkit_id)

    # toolkit_temp应该支持数据库接入

    result = run_toolkit_sub(project_id, staging_data_set_id, toolkit_obj,
                             fields, index_nan, job_obj, *argv, **conf)
    return result


def add_toolkit_with_ownership(name, description, target_py_code,
                               entry_function, parameter_spec, user_ID,
                               is_private):
    toolkit = toolkit_business.add(name, description, target_py_code,
                                   entry_function, parameter_spec)
    user = user_business.get_by_user_ID(user_ID)
    ownership_business.add(user, is_private, toolkit=toolkit)


if __name__ == '__main__':
    print(get_all_public_toolkit_by_new_category())
