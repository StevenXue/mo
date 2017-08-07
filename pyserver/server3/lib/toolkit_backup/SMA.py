import numpy as np


def toolkit_moving_average(arr, window):
    """simple moving average"""
    ret = np.cumsum(np.array(arr), dtype=float)
    ret[window:] = ret[window:] - ret[:-window]
    return ret[window - 1:] / window

# toolkit_result_sma = toolkit_moving_average(input_data, window=3)
