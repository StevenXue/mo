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


def usr_story1_exploration(data, d_type, group_num=10):
    # 转换，把所有键值对里的值变成一个数组返回(arr_temp)
    # print (type(data))
    if d_type == 'int':
        arr_temp = [int(list(arr.values())[0]) for arr in data if isNaN(list(arr.values())[0]) == False and list(arr.values())[0] != '']
    elif d_type == 'float':
        arr_temp = [float(list(arr.values())[0]) for arr in data if isNaN(list(arr.values())[0]) == False and list(arr.values())[0] != '']
    else:
        arr_temp = [list(arr.values())[0] for arr in data if isNaN(list(arr.values())[0]) == False and list(arr.values())[0] != '']
    print ('arr_temp', arr_temp)

    # 生成的dict有4栏:
    # 数值类型 'type',
    # 基本信息 'gen_info', 产生一些数据的基本信息
    # 频率直方图/词云图 'freq_hist'
    # 假设检验的信息 'hypo_info'
    gen_info = generate_stats_info(arr_temp, d_type)
    info_dict = {'type': d_type, 'gen_info': gen_info}
    if d_type == 'int' or d_type == 'float':
        arr_array = np.array(arr_temp)
        mean, std, min, max = (gen_info['mean'], gen_info['std'], int(gen_info['min']), int(gen_info['max']))
        interval = (max - min + 1) / group_num
        # 给出x轴
        x_domain = np.arange(min, max+interval, interval)
        freq_hist = {"freq_hist": arr_array}
        df = pd.DataFrame(freq_hist)
        # 给出y轴
        y_domain = df.groupby(pd.cut(df.freq_hist, x_domain)).count().freq_hist.values/interval
        # print ('y_domain', y_domain)

        # 注意x会比y多一个
        info_dict['freq_hist'] = {'x_domain': x_domain.tolist(), 'y_domain': y_domain.tolist()}
        flag, p_value, standard_norm_value = hypo_test(arr_array, mean, std, x_domain, 'norm')
        info_dict['hypo'] = {'flag': flag, 'p_value': p_value, 'standard_norm_value': standard_norm_value}
    else:
        seta = set(arr_temp)
        info_dict['freq_hist'] = [{'text': el, 'value': arr_temp.count(el)} for el in seta if arr_temp.count(el) > 1]
        # info_dict['freq_hist'] = [{'name': key, 'value': len(list(group))} for key, group in groupby(arr_temp)]
        info_dict['hypo'] = {}

    return info_dict


# 用来获取数据的基本信息（长度，均值，值域等）
def generate_stats_info(data, d_type):
    if d_type == 'int':
        return pd.DataFrame(data).describe().astype(int).to_dict()[0]
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

        return flag, p_value, arr_norm_draw.tolist()


def isNaN(num):
    return num != num