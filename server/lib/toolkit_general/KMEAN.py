from sklearn.cluster import KMeans
import numpy as np


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
    return kmeans.labels_, kmeans.cluster_centers_, kmeans.inertia_


def k_mean_predict(arr0, arr1, list_points, n_clusters=2):
    """predict list of points, each of point is a [1, 2] points-like"""

    X = np.array([[arr0[i], arr1[i]] for i in range(len(arr0))])
    kmeans = KMeans(n_clusters).fit(X)

    return kmeans.predict(list_points)


# def k_mean_transform(arr0, arr1, n_clusters=2):
#     """predict list of points, each of point is a [1, 2] points-like"""
#
#     X = np.array([[arr0[i], arr1[i]] for i in range(len(arr0))])
#     kmeans = KMeans(n_clusters).fit(X)
#
#     return kmeans.transform(X)
