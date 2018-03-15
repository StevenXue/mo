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
# from minepy import MINE
from sklearn.decomposition import PCA
from sklearn.manifold import TSNE
import scipy.stats as stats


######################################################################
# 探索数据 Exploring Data
# The Explore procedure produces detailed univariate statistics and graphs
# for numeric scale variables for an entire sample, or for subsets of a
# sample. It can also be used to assess the normality of a numeric scale
# variable with special inferential statistics and detailed diagnostic plots.


###################################
# 数据量  ！！！
def toolkit_n(arr0):
    return np.size(np.array(arr0))


###################################
# 中心位置（均值、中位数、众数）
# 平均值
def toolkit_average(arr0):
    return np.average(np.array(arr0))


# 中位数
def toolkit_median(arr0):
    return np.median(np.array(arr0))


# 众数
def toolkit_mode(arr0):
    count = np.bincount(np.array(arr0))
    max_mode = np.argmax(count)
    return max_mode, np.max(count)


# 移动平均值
def toolkit_moving_average(arr0, window):
    ret = np.cumsum(np.array(arr0), dtype=float)
    ret[window:] = ret[window:] - ret[:-window]
    return list(ret[window - 1:] / window)


# IQR   ！！！
def toolkit_IQR(arr0):
    q75, q25 = np.percentile(arr0, [75, 25])
    iqr = q75 - q25
    return iqr

# 发散程度（极差、方差、标准差、变异系数、最大值、最小值）


# 全距 极差
def toolkit_range(arr0):
    np_temp = np.array(arr0)
    return np.max(np_temp) - np.min(np_temp)


# 方差
def toolkit_variance(arr0):
    np_temp = np.array(arr0)
    return np.var(np_temp)


# 标准差
def toolkit_std(arr0):
    np_temp = np.array(arr0)
    return np.std(np_temp)


# 变异系数  new mean(data) / std(data)  ！！！
# FIXME 其定义为标准差与平均值之比
def toolkit_cv(arr0):
    return toolkit_average(arr0) / toolkit_std(arr0)


# 最大值  new   ！！！
def toolkit_max(arr0):
    np_temp = np.array(arr0)
    return np.max(np_temp)


# 最小值  new   ！！！
def toolkit_min(arr0):
    np_temp = np.array(arr0)
    return np.min(np_temp)

###################################
# 偏差程度


# z-分数 (data-mean(data)) / std(data)
def toolkit_z_score(arr0):
    return (arr0 - toolkit_average(arr0)) / toolkit_std(arr0)


###################################
# 相关程度

# 协方差 cov  ！！！
def toolkit_cov(arr0):
    matrix = np.array(arr0)
    t_matrix = np.transpose(matrix)
    return np.cov(t_matrix[0], t_matrix[1])


# 互相关 cov Cross-correlation of two 1-dimensional sequences  ！！！
def toolkit_correlation(arr0, mode='valid'):
    matrix = np.array(arr0)
    t_matrix = np.transpose(matrix)
    return np.correlate(t_matrix[0], t_matrix[1])


# 皮尔森相关系数
def toolkit_pearson(arr0):
    matrix = np.array(arr0)
    t_matrix = np.transpose(matrix)
    return np.corrcoef(t_matrix[0], t_matrix[1])[0, 1]


# 最大互信息数
def toolkit_mic(arr0):
    pass
# def toolkit_mic(arr0):
#     matrix = np.array(arr0)
#     t_matrix = np.transpose(matrix).astype(float)
#     # mine = MINE(alpha, c, est="mic_approx")
#     mine = MINE(alpha=0.6, c=15, est="mic_approx")
#     mic_result = []
#     for t_matr in t_matrix[1:]:
#         mine.compute_score(t_matrix[0], t_matr)
#         mic_result.append(mine.mic())
#     return mic_result

######################################################################
# 数据处理 Data Pre-processing


###################################
# 降维
# 降维PCA-主成分分析算法
def dimension_reduction_PCA(arr0, n_components='mle'):
    matrix = np.array(arr0)
    svd_solver = 'auto'
    pca = PCA(n_components=n_components, svd_solver=svd_solver).fit(matrix)
    result = pca.transform(matrix)
    # label = data_utility.retrieve_nan_index(result.tolist(), index)
    label = result.tolist()
    return label, pca.components_.tolist(), pca.explained_variance_.tolist(), pca.explained_variance_ratio_.tolist(), pca.mean_.tolist(), pca.noise_variance_


# 降维TSNE-t_分布邻域嵌入算法
def dimension_reduction_TSNE(arr0, n_components=2):
    matrix = np.array(arr0)
    t_sne = TSNE(n_components=n_components, random_state=0)
    np.set_printoptions(suppress=True)
    result = t_sne.fit(matrix)
    kl_divergence = result.kl_divergence_
    # label = data_utility.retrieve_nan_index(t_sne.fit_transform(matrix).tolist(), index)
    label = t_sne.fit_transform(matrix).tolist()
    return label, kl_divergence


# K平均数算法
def k_mean(arr0, k=2):
    matrix = np.array(arr0)
    k_means = KMeans(k).fit(matrix)
    result = k_means.labels_
    # label = data_utility.retrieve_nan_index(result.tolist(), index)
    label = result.tolist()
    return label, k, k_means.cluster_centers_.tolist(), k_means.inertia_


def k_mean_predict(arr0, list_points, n_clusters=2):
    matrix = np.array(arr0)
    k_means = KMeans(n_clusters).fit(matrix)
    return k_means.predict(list_points)
