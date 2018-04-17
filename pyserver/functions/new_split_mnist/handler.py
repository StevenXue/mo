import sys
import logging
import numpy as np
from sklearn.model_selection import train_test_split

from function import parameters_pb2


def serialize_params(ndarrays, name, ratio):
    para = parameters_pb2.Parameters()
    para.name = name
    para.ratio = ratio
    for ndarray in ndarrays:
        arr = para.datasets.add()
        arr.data_bytes = ndarray.tobytes()
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


def handle(params):
    p = deserialize_params(params)
    datasets = [restore_ndarray(dataset) for dataset in p.datasets]
    dss = train_test_split(*datasets, test_size=p.ratio, random_state=42)
    sys.stdout.buffer.write(serialize_params(dss, p.name, p.ratio))
