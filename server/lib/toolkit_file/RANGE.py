import numpy as np


def toolkit_range(arr):
    """range"""
    np_temp = np.array(arr)
    return np.max(np_temp) - np.min(np_temp)

# toolkit_result_range = toolkit_range(input_data)
