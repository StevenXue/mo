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
from scipy import stats
import pandas as pd
import numpy as np


def usr_story1_exploration(data, d_type, group_num=10):
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
        mean, std, min, max = (gen_info['mean'], gen_info['std'], int(gen_info['min']), int(gen_info['max']))
        interval = (max - min) / group_num

        # 给出x轴
        x_domain = np.arange(min, max+1, interval)
        freq_hist = {"freq_hist": arr_array}
        df = pd.DataFrame(freq_hist)
        y_domain = df.groupby(pd.cut(df.freq_hist, x_domain)).count().freq_hist.values

        # 注意x会比y多一个
        print('x-y',len(x_domain)-len(y_domain))
        info_dict['freq_hist'] = {'x_domain': x_domain.tolist(), 'y_domain': y_domain.tolist()}
        flag, p_value, standard_norm_value = hypo_test(arr_array, mean, std, x_domain, 'norm')
        info_dict['hypo'] = {'flag': flag, 'p_value': p_value, 'standard_norm_value': standard_norm_value}
    else:
        info_dict['freq_hist'] = [{'name': key, 'value': len(list(group))} for key, group in groupby(arr_temp)]
        info_dict['hypo'] = {}

    return info_dict


# 用来获取数据的基本信息（长度，均值，值域等）
def generate_stats_info(data):
    return pd.DataFrame(data).describe().to_dict()[0]


# 用来做假设检验，默认是正太分布
def hypo_test(arr, mean, std, x_range, type='norm'):
    if type == 'norm':
        arr = np.array(arr)
        # 产生标准正太分布数值转换，用于检验
        arr_norm_test = [(arr - mean) / std]
        p_value = stats.kstest(arr_norm_test, 'norm')[1]
        flag = 1 if p_value >= 0 else 0
        # 根据x, 产生概率密度函数，真是的正太分布，用于作图, 需要tolist()
        arr_norm_draw = np.exp(-((x_range - mean) ** 2) / (2 * std ** 2)) / (std * np.sqrt(2 * np.pi))
        return flag, p_value, arr_norm_draw.tolist()
