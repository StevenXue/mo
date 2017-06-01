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
from sklearn.manifold import TSNE


def toolkit_average(arr0):
    return np.average(np.array(arr0))


def toolkit_median(arr0):
    return np.median(np.array(arr0))


def toolkit_mic(arr0, alpha=0.6, c=15):
    matrix = np.array(arr0)
    t_matrix = np.transpose(matrix)
    mine = MINE(alpha, c, est="mic_approx")
    mine.compute_score(t_matrix[0], t_matrix[1])
    return mine.mic()


def toolkit_mode(arr0):
    count = np.bincount(np.array(arr0))
    max_mode = np.argmax(count)
    return max_mode, np.max(count)


def toolkit_pearson(arr0):
    matrix = np.array(arr0)
    t_matrix = np.transpose(matrix)
    return np.corrcoef(t_matrix[0], t_matrix[1])[0, 1]


def toolkit_range(arr0):
    np_temp = np.array(arr0)
    return np.max(np_temp) - np.min(np_temp)


def toolkit_moving_average(arr0, window):
    ret = np.cumsum(np.array(arr0), dtype=float)
    ret[window:] = ret[window:] - ret[:-window]
    return list(ret[window - 1:] / window)


def toolkit_std(arr0):
    np_temp = np.array(arr0)
    return np.std(np_temp)


def toolkit_variance(arr0):
    np_temp = np.array(arr0)
    return np.var(np_temp)


def k_mean(arr0, n_clusters=2):
    matrix = np.array(arr0)
    kmeans = KMeans(n_clusters).fit(matrix)
    return kmeans.labels_.tolist(), kmeans.cluster_centers_.tolist(), kmeans.inertia_


def k_mean_predict(arr0, list_points, n_clusters=2):
    matrix = np.array(arr0)
    kmeans = KMeans(n_clusters).fit(matrix)
    return kmeans.predict(list_points)


def dimension_reduction_PCA(arr0, n_components='mle'):
    matrix = np.array(arr0)
    svd_solver = 'auto'
    pca = PCA(n_components=n_components, svd_solver=svd_solver).fit(matrix)
    newData = pca.fit_transform(matrix)
    return newData.tolist(), pca.components_.tolist(), pca.explained_variance_.tolist(), pca.explained_variance_ratio_.tolist(), pca.mean_.tolist(), pca.noise_variance_


def dimension_reduction_TSNE(arr0, n_components=2):
    matrix = np.array(arr0)
    tsne = TSNE(n_components=n_components, random_state=0)
    np.set_printoptions(suppress=True)
    result = tsne.fit_transform(matrix)
    return result