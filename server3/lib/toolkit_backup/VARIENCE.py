import numpy as np


def toolkit_varience(arr):
    """MSE represents Mean Square Error"""
    np_temp = np.array(arr)
    return np.var(np_temp)

# toolkit_var = toolkit_varience(input_data)
