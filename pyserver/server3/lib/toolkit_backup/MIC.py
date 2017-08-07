import numpy as np
from minepy import MINE


def toolkit_mic(arr0, arr1, alpha=0.6, c=15):
    """MIC"""

    np_temp0 = np.array(arr0)
    np_temp1 = np.array(arr1)

    mine = MINE(alpha=0.6, c=15, est="mic_approx")
    mine.compute_score(np_temp0, np_temp1)

    return mine.mic()

# toolkit_mic = toolkit_mic(input_data)
