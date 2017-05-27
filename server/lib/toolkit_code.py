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
from sklearn.decomposition import PCA

from service import job_service


@job_service.create_toolkit_job("平均值")
def toolkit_average(arr0):
    """average"""
    return np.average(np.array(arr0))


@job_service.create_toolkit_job("中位数")
def toolkit_median(arr0):
    """median"""
    return np.median(np.array(arr0))


@job_service.create_toolkit_job("最大互信息数")
def toolkit_mic(arr0, arr1, alpha=0.6, c=15):
    """MIC"""

    np_temp0 = np.array(arr0)
    np_temp1 = np.array(arr1)

    mine = MINE(alpha=0.6, c=15, est="mic_approx")
    mine.compute_score(np_temp0, np_temp1)

    return mine.mic()


@job_service.create_toolkit_job("众数")
def toolkit_mode(arr0):
    """list the first mode(elements of maximum number)"""
    count = np.bincount(np.array(arr0))
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
def toolkit_range(arr0):
    """range"""
    np_temp = np.array(arr0)
    return np.max(np_temp) - np.min(np_temp)


@job_service.create_toolkit_job("移动平均值")
def toolkit_moving_average(arr0, window):
    """simple moving average"""
    ret = np.cumsum(np.array(arr0), dtype=float)
    ret[window:] = ret[window:] - ret[:-window]
    return ret[window - 1:] / window


@job_service.create_toolkit_job("标准差")
def toolkit_std(arr0):
    """STD"""
    np_temp = np.array(arr0)
    return np.std(np_temp)


@job_service.create_toolkit_job("方差")
def toolkit_variance(arr0):
    """MSE represents Mean Square Error"""
    np_temp = np.array(arr0)
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
# run = k_mean_predict


def dimension_reduction_PCA(arr, n_components, svd_solver):
    """
    pram: arr: array-like, shape (n_samples, n_features)
          n_components: int, float, None or string
          svd_solver: string {‘auto’, ‘full’, ‘arpack’, ‘randomized’}
          auto :
            the solver is selected by a default policy based on X.shape and n_components: 
            if the input data is larger than 500x500 and the number of components to extract is lower than 80% of the smallest dimension of the data,
            then the more efficient ‘randomized’ method is enabled. Otherwise the exact full SVD is computed and optionally truncated afterwards.
          full :
            run exact full SVD calling the standard LAPACK solver via scipy.linalg.svd and select the components by postprocessing
          arpack :
            run SVD truncated to n_components calling ARPACK solver via scipy.sparse.linalg.svds. It requires strictly 0 < n_components < X.shape[1]
          randomized :
            run randomized SVD by the method of Halko et al.
    return: pca.components_: Principal axes in feature space, representing the directions of maximum variance in the data.
            pca.explained_variance_: The amount of variance explained by each of the selected components.
            pca.explained_variance_ratio_: Percentage of variance explained by each of the selected components.
            pca.mean_: Per-feature empirical mean, estimated from the training set.
            pca.noise_variance_: The estimated noise covariance following the Probabilistic PCA model from Tipping and Bishop 1999.
    """
    X = np.array(arr)
    pca = PCA(n_components=n_components, svd_solver=svd_solver)
    pca = pca.fit(X)
    return pca.components_, pca.explained_variance_, pca.explained_variance_ratio_, pca.mean_, pca.noise_variance_



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