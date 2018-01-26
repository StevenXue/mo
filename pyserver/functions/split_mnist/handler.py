import json
import pandas as pd
import simplejson
import numpy as np

from bson import ObjectId
from datetime import datetime


class JSONEncoder(simplejson.JSONEncoder):

    # arbitrary iterators
    def default(self, o):
        try:
            iterable = iter(o)
        except TypeError:
            if isinstance(o, ObjectId):
                return str(o)
            elif isinstance(o, datetime):
                return str(o)
            elif isinstance(o, np.ndarray):
                return o.tolist()
            elif isinstance(o, np.generic):
                return np.asscalar(o)
        else:
            return list(iterable)
        # Let the base class default method raise the TypeError
        return JSONEncoder.default(self, o)


def convert_to_json(bson_obj):
    json_obj = JSONEncoder(ignore_nan=True).encode(bson_obj)
    return json_obj


def handle(mnist):
    mnist = json.loads(mnist)
    X, y = mnist["data"], mnist["target"]
    shuffle_index = np.random.permutation(60000)
    X_train, X_test, y_train, y_test = X[:60000], X[60000:], y[:60000], y[60000:]
    X_train, y_train = X_train[shuffle_index], y_train[shuffle_index]
    print(convert_to_json({
        'X_train': X_train,
        'X_test': X_test,
        'y_train': y_train,
        'y_test': y_test
    }))
