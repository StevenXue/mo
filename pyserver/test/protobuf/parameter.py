# -*- coding: utf-8 -*-
import numpy as np
import parameters_pb2
import ndarray_pb2

def serialize_params(ndarrays, name, ratio):
    para = parameters_pb2.Parameters()
    para.name = name
    para.ratio = ratio
    for ndarray in ndarrays:
        barray = ndarray.tobytes()
        arr = para.datasets.add()
        arr.data_bytes = barray
        arr.shape.extend(list(ndarray.shape))
        arr.dtype = ndarray.dtype.name
    return para.SerializeToString()


def deserialize_params(string):
    para = parameters_pb2.Parameters()
    para.ParseFromString(string)
    return para


def restore_ndarray(ndarray):
    return np.frombuffer(ndarray.data_bytes, dtype=ndarray.dtype).reshape(
        *ndarray.shape)


import requests
from numpy.random import RandomState
from sklearn.datasets import fetch_mldata

mnist = fetch_mldata('MNIST original')
# generate random ndarray
rs = RandomState(seed=123456789)
size1 = (10, 10)
ndarray = rs.rand(*size1).astype('float64')

str = serialize_params([mnist['data'], mnist['target']], 'ssss', 0.3)
print(2)
res = requests.post("http://localhost:8080/function/new_split_mnist",
                    str).content
print(3)
p = deserialize_params(res)
for d in p.datasets:
    print(restore_ndarray(d).shape)
from sklearn.model_selection import train_test_split
# np.array([1])