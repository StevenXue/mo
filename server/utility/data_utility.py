# encoding: utf-8
"""
utility used in all project

Author: Zhaofeng Li
Date: 2017.06.09
"""
import numpy as np

# int, float
def convert_data_array_by_fields(array, field_type_arrays):
    """

    :param array: array of data_set documents
    :param field_type_arrays: [['name', 'str'],['age', 'int'], ['salary',
    'float']]
    :return:
    """
    failure_exists = False
    failure_count = {f_t[0]: [] for f_t in field_type_arrays}
    for i, a in enumerate(array):
        for f_t in field_type_arrays:
            field = f_t[0]
            value_type = f_t[1]
            try:
                if value_type == 'int':
                    a[field] = str_to_int(a[field])
                elif value_type == 'float':
                    a[field] = str_to_float(a[field])
                elif value_type == 'str':
                    a[field] = str(a[field])
            except ValueError:
                failure_count[field].append(i)
                failure_exists = True
                continue
    if failure_exists:
        return {'result': array, 'failure_count': failure_count}
    else:
        return {'result': array}


def str_to_int(s):
    return int(float(s))


def str_to_float(s):
    return float(s)


def convert_string_to_number(s):
    try:
        return int(s)
    except ValueError:
        return float(s)


def convert_string_to_number_with_poss(s):
    if s == "":
        return np.nan
    else:
        try:
            return int(s)
        except ValueError:
            try:
                return float(s)
            except ValueError:
                return s
