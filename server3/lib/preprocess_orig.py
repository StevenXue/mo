#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Zhaofeng Li
# @version  : 1.0
# @date     : 2017-06-21 11:00pm
# @function : preprocess methods
# @running  : python
"""

import numpy as np
from sklearn.preprocessing import StandardScaler


def standard_scaler(arr0, index, n_clusters=2):
    matrix = np.array(arr0)

    return StandardScaler().fit_transform(matrix)

