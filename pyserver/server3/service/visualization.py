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
import pandas as pd
import numpy as np


def usr_story1_exploration(data, d_type):
    # 转换，把所有键值对里的值变成一个数组返回(arr_temp)
    col = data[0].keys()[0]
    arr_temp = [arr[col] for arr in data]

    # 生成的dict有4栏:
    # 数值类型 'type',
    # 基本信息 'gen_info', 产生一些数据的基本信息
    # 频率直方图/词云图 'freq_hist'
    # 假设检验的信息 'hypo_info'
    gen_info = generate_stats_info(arr_temp)
    info_dict = {'type': d_type, 'gen_info': gen_info}

    if d_type == 'int' or d_type == 'float':
        arr_array = np.array(arr_temp)
        mean = gen_info['mean']
        std = gen_info['std']
        range = gen_info['max'] - gen_info['min']


    else:
        info_dict['freq_hist'] = [{'name': key, 'value': len(list(group))} for key, group in groupby(arr_temp)]
        info_dict['hypo'] = {}


def generate_stats_info(data):
    return pd.DataFrame(data).describe().to_dict()[0]


def hypo_test(arr, mean, std, type='norm'):
    arr = np.array(arr)

    # if 1:
    # 产生标准正太分布数值转换，用于检验
    arr_norm_test = [(arr - mean) / std]
    # 根据x, 产生概率密度函数，真是的正太分布，用于作图
    arr_norm_draw = np.exp(-((arr - mean) ** 2) / (2 * std ** 2)) / (std * np.sqrt(2 * np.pi))
