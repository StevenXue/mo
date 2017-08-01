"""
use hyperas to tune hyperparameters of basic models

Author: Bingwei Chen
Date: 2017.07.28

1. test linear regression model
2. define JSON template got from frontend
3. define JSON give to frontend to generate UI
4. using JSON from frontend to generate hyperopt code
5. run hyperopt code
"""

DISTRIBUTE = {
    "name": "distribute_choice",
    "type": {
        'key': 'choice',
        'des': 'distribute choice for hyperparameters tuning',
        'range': [
            {
                'name': "uniform",
                'type': {
                    'key': 'join_low_high',
                    'des': 'Uniform distribution, Returns a value uniformly between low and high.',
                },
                'default': "0, 1",
                'eg': "0, 1"
            },
            {
                'name': "choice",
                'type': {
                    'key': 'multiple',
                    'des': "Choice distribution, "
                           "Returns one of the options, which should be a list or tuple.",
                },
                'default': None,
                "eg": [256, 512, 1024]
            }
        ]
    },
}

LinearRegression = {
    'estimator': {
        'args': [
            {
                "name": "weight_column_name",
                "type": {
                    "key": "string",
                    "des": "A string defining feature column name representing "
                           "weights. It is used to down weight or boost "
                           "examples during training. It will be multiplied by "
                           "the loss of the example."
                },
                "default": None,
                "required": False,
                "distribute": DISTRIBUTE
            },
            {
                "name": "gradient_clip_norm",
                "type": {
                    "key": "float",
                    "des": "A float > 0. If provided, gradients are\
                    clipped to their\
global norm\
with this clipping ratio.",
                    "range": [0.0, 100]
                },
                "default": None,
                "required": True,
                "distribute": DISTRIBUTE
            }
        ]
    },
    'fit': {
        "data_fields": {
            "name": "x_y_fields",
            "type": {
                "key": "select_box",
                "des": "data fields for x",
            },
            "default": None,
            "required": True,
            "data_type": None,
            "len_range": None
        },
        'args': [
            {
                "name": "steps",
                "type": {
                    "key": "int",
                    "des": "steps for training",
                    "range": None
                },
                "default": 30,
                "required": True,
                "distribute": DISTRIBUTE
            },
        ]
    },
    'evaluate': {
        'args': [
            {
                "name": "steps",
                "type": {
                    "key": "int",
                    "des": "steps for evaluate",
                    "range": None
                },
                "default": 1,
                "required": True,
                "distribute": DISTRIBUTE
            },
        ]
    }
}
