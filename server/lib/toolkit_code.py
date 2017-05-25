#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 11:00pm
# @function : Getting all of the toolkit of statics analysis
# @running  : python
# Further to FIXME of None
"""

import numpy as np
from sklearn.cluster import KMeans
from minepy import MINE

from service import job_service


@job_service.create_toolkit_job("平均值")
def toolkit_average(arr):
    """average"""
    return np.average(np.array(arr))


@job_service.create_toolkit_job("中位数")
def toolkit_median(arr):
    """median"""
    return np.median(np.array(arr))


@job_service.create_toolkit_job("最大互信息数")
def toolkit_mic(arr0, arr1, alpha=0.6, c=15):
    """MIC"""

    np_temp0 = np.array(arr0)
    np_temp1 = np.array(arr1)

    mine = MINE(alpha=0.6, c=15, est="mic_approx")
    mine.compute_score(np_temp0, np_temp1)

    return mine.mic()


@job_service.create_toolkit_job("众数")
def toolkit_mode(arr):
    """list the first mode(elements of maximum number)"""
    count = np.bincount(np.array(arr))
    max_mode = np.argmax(count)
    return max_mode, np.max(count)


@job_service.create_toolkit_job("皮尔森相关系数")
def toolkit_pearson(arr0, arr1):
    """
    PEARSON could calculate the corrcoef of two or more arrays
    In this part, 2 of array is ensured
    """

    np_temp0 = np.array(arr0)
    np_temp1 = np.array(arr1)
    return np.corrcoef(np_temp0, np_temp1)[0, 1]


@job_service.create_toolkit_job("全距")
def toolkit_range(arr):
    """range"""
    np_temp = np.array(arr)
    return np.max(np_temp) - np.min(np_temp)


@job_service.create_toolkit_job("移动平均值")
def toolkit_moving_average(arr, window):
    """simple moving average"""
    ret = np.cumsum(np.array(arr), dtype=float)
    ret[window:] = ret[window:] - ret[:-window]
    return ret[window - 1:] / window


@job_service.create_toolkit_job("标准差")
def toolkit_std(arr):
    """STD"""
    np_temp = np.array(arr)
    return np.std(np_temp)


@job_service.create_toolkit_job("方差")
def toolkit_variance(arr):
    """MSE represents Mean Square Error"""
    np_temp = np.array(arr)
    return np.var(np_temp)


@job_service.create_toolkit_job("K平均数算法")
def k_mean(arr0, arr1, n_clusters=2):
    """
    k_mean returns:
    1. kmeans.labels_:
        # array([0, 0, 0, 1, 1, 1], dtype=int32)
    2. kmeans.cluster_centers_:
        # array([[ 1.,  2.],
        #        [ 4.,  2.]])
    3. kmeans.inertia_:
        # Sum of distances of samples to their closest cluster center.
    """

    X = np.array([[arr0[i], arr1[i]] for i in range(len(arr0))])
    kmeans = KMeans(n_clusters).fit(X)
    return kmeans.labels_.tolist(), kmeans.cluster_centers_.tolist(), kmeans.inertia_


@job_service.create_toolkit_job("K平均数算法")
def k_mean_predict(arr0, arr1, list_points, n_clusters=2):
    """predict list of points, each of point is a [1, 2] points-like"""

    X = np.array([[arr0[i], arr1[i]] for i in range(len(arr0))])
    kmeans = KMeans(n_clusters).fit(X)

    return kmeans.predict(list_points)


dict_of_toolkit = {u"平均值": toolkit_average,
                   u"中位数": toolkit_median,
                   u"最大互信息数": toolkit_mic,
                   u"众数": toolkit_mode,
                   u"皮尔森相关系数": toolkit_pearson,
                   u"全距": toolkit_range,
                   u"移动平均值": toolkit_moving_average,
                   u"标准差": toolkit_std,
                   u"方差": toolkit_variance,
                   u"K平均数算法": k_mean}