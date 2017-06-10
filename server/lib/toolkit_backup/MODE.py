import numpy as np


def toolkit_mode(arr):
    """list the first mode(elements of maximum number)"""
    count = np.bincount(np.array(arr))
    max_mode = np.argmax(count)
    return max_mode, np.max(count)

# toolkit_result_mode = toolkit_mode(input_data)
