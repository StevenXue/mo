#!/usr/bin/python
# -*- coding: UTF-8 -*-
'''
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-05-23 11:00pm
# @function : Getting all of the toolkit of statics analysis
# @running  : python
# Further to FIXME of None
'''

# import numpy as np
import pandas as pd


def convert_json_str_to_dataframe(arr):
    """
    convert input data:
    from
        data from staging data => database_type like, which is a list of dicts
    to
        DataFrame in pandas
    """
    col = arr[0].keys()
    df_converted = pd.DataFrame([[i[j] for j in col] for i in arr],
                                columns=col)
    return df_converted


if __name__ == '__main__':
    pass
