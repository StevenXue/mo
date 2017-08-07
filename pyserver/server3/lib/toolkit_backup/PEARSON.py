import numpy as np


def toolkit_pearson(arr0, arr1):
    """
    PEARSON could calculate the corrcoef of two or more arrays
    In this part, 2 of array is ensured
    """

    np_temp0 = np.array(arr0)
    np_temp1 = np.array(arr1)
    return np.corrcoef(np_temp0, np_temp1)[0, 1]

# toolkit_pearson = toolkit_pearson(input_data)
