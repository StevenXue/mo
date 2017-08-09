#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-07-10 11:00pm
# @function : Getting all of the method of visualization analysis
# @running  : python
# Further to FIXME of None
"""

from itertools import groupby
# import math
from scipy import stats
import pandas as pd
import numpy as np

from bson import ObjectId

from server3.utility import data_utility, json_utility
from server3.business import staging_data_business


def usr_story1_exploration(data, d_type, group_num=10):
    # 转换，把所有键值对里的值变成一个数组返回(arr_temp)
    # print (type(data))
    if d_type == 'integer' or d_type == 'int':
        arr_temp = [int(list(arr.values())[0]) for arr in data if isNaN(list(arr.values())[0]) == False and list(arr.values())[0] != '']
    elif d_type == 'float':
        arr_temp = [float(list(arr.values())[0]) for arr in data if isNaN(list(arr.values())[0]) == False and list(arr.values())[0] != '']
    elif d_type == 'string' or d_type == 'str':
        arr_temp = [list(arr.values())[0] for arr in data if isNaN(list(arr.values())[0]) == False and list(arr.values())[0] != '']

    # 生成的dict有4栏:
    # 数值类型 'type',
    # 基本信息 'gen_info', 产生一些数据的基本信息
    # 频率直方图/词云图 'freq_hist'
    # 假设检验的信息 'hypo_info'
    gen_info = generate_stats_info(arr_temp, d_type)
    info_dict = {'type': d_type, 'gen_info': gen_info}
    if d_type == 'integer' or d_type == "int" or d_type == 'float':
        arr_array = np.array(arr_temp)
        mean, std, min, max = (gen_info['mean'], gen_info['std'], int(gen_info['min']), int(gen_info['max']))
        interval = (max - min + 1) / group_num
        # 给出x轴
        x_domain = np.arange(min, max+interval, interval).round(1)
        freq_hist = {"freq_hist": arr_array}
        df = pd.DataFrame(freq_hist)
        # 给出y轴
        y_domain = df.groupby(pd.cut(df.freq_hist, x_domain)).count().freq_hist.values/interval
        # y_domaining = [format_round(x, 4) for x in y_domain * 1000]
        # print ('y_domain', y_domain.apply(lambda x: '%.3f' % x))

        # 注意x会比y多一个
        info_dict['freq_hist'] = {'x_domain': x_domain.tolist(), 'y_domain': (y_domain*1000).round(3).tolist()}
        flag, p_value, standard_norm_value = hypo_test(arr_array, mean, std, x_domain, 'norm')
        info_dict['hypo'] = {'flag': flag, 'p_value': p_value, 'standard_norm_value': standard_norm_value}
    elif d_type == 'string' or d_type == 'str':
        seta = set(arr_temp)
        info_dict['freq_hist'] = [{'text': el, 'value': arr_temp.count(el)} for el in seta if arr_temp.count(el) > 1]
        # info_dict['freq_hist'] = [{'name': key, 'value': len(list(group))} for key, group in groupby(arr_temp)]
        info_dict['hypo'] = {}

    return info_dict


# 用来获取数据的基本信息（长度，均值，值域等）
def generate_stats_info(data, d_type):
    if d_type == 'int':
        return pd.DataFrame(data).describe().astype(float).to_dict()[0]
    elif d_type == 'float':
        return pd.DataFrame(data).describe().astype(float).to_dict()[0]
    else:
        return pd.DataFrame(data).describe().astype(str).to_dict()[0]


# 用来做假设检验，默认是正太分布
def hypo_test(arr, mean, std, x_range, type='norm'):
    if type == 'norm':
        # 产生标准正太分布数值转换，用于检验
        # arr_norm_test = [(arr - mean) / std]

        # 根据x, 产生概率密度函数，真是的正太分布，用于作图, 需要tolist()
        arr_norm_draw = np.exp(-((x_range - mean) ** 2) / (2 * std ** 2)) / (std * np.sqrt(2 * np.pi))

        # p_value = stats.kstest(arr, 'norm', args=(mean, std))[1]
        # print (stats.kstest(arr, 'norm', args=(mean, std)))

        # ks-test
        p_value = stats.shapiro(arr)[1]
        # print (stats.shapiro(arr))
        flag = 1 if p_value >= 0.05 else 0

        return flag, p_value, (arr_norm_draw*1000).round(3).tolist()


def usr_story2_exploration(data, d_type, sds_id):
    print("sds-id", sds_id, str(sds_id))
    if d_type == 0:
        cols = data["fields"]
        # TODO 暂时只支持3个栏位以上的
        if len(cols) > 2:
            # nan的所有位置
            nan_index = [index for index, item in enumerate(data["labels"]) if isNaN(item)]
            scatter_without_nan = [item for index, item in enumerate(data["scatter"]) if not isNaN(item)]
            scatter = data_utility.retrieve_nan_index(t_sne(scatter_without_nan), nan_index)
            centers = t_sne(data["centers"])

            data["scatter"] = scatter
            data["centers"] = centers

            scatter_zip = list(zip(*scatter_without_nan))
            temp = {}
            for arr in scatter_zip:
                name = cols.pop(0)
                temp.update({name: freq_hist(arr)})
            data.update({"hist_freq": temp})
    elif d_type == 1:
        table_data = json_utility.me_obj_list_to_dict_list(staging_data_business.get_by_staging_data_set_id_limit(ObjectId(sds_id), 5))
        data.update({"table": table_data})
    elif d_type == 2:
        data.update({
            "1": None,
            "2": None
        })
    else:
        pass

    return data


def isNaN(num):
    return num != num


def format_round(f, n):
    if round(f) == f:
        m = len(str(f))-1-n
        if f/(10**m) == 0.0:
            return f
        else:
            return float(int(f)/(10**m)*(10**m))
    return round(f, n - len(str(int(f)))) if len(str(f))>n+1 else f


def t_sne(arr):
    from sklearn.manifold import TSNE
    matrix = np.array(arr)
    t_sne = TSNE(n_components=2, random_state=0)
    np.set_printoptions(suppress=True)
    result = t_sne.fit_transform(matrix).tolist()
    return result


def freq_hist(arr, group_num=5):
    arr_array = np.array(arr)
    min = arr_array.min()
    max = arr_array.max()
    interval = (max - min + 1) / group_num
    # 给出x轴
    x_domain = np.arange(min, max + interval, interval).round(1)
    freq_hist = {"freq_hist": arr_array}
    df = pd.DataFrame(freq_hist)
    # 给出y轴
    y_domain = df.groupby(pd.cut(df.freq_hist, x_domain)).count().freq_hist.values
    # 注意x会比y多一个
    return {'x_domain': x_domain.tolist(), 'y_domain': (y_domain * 1000).round(3).tolist()}