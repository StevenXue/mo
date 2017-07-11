FILL_BLANK = 'BLANK_GRID'
PARAMETER_SPEC = [
    {
        "name": "validation",
        "type": {
            "key": "float",
            "des": "blablabla",
            "range": [0.1, 10.1]
        },
        "default": None,
        'required': True
    },
    {
        "name": "k",
        "type": {
            "key": "int",
            "des": "blablabla",
            "range": [0, 10]
        },
        "default": 2,
        'required': True
    },
    {
        "name": "heheda",
        "type": {
            "key": "string",
            "des": "blablabla",
        },
        "default": "买了我的瓜",
        'required': True
    },
    {
        "name": "validation",
        "type": {
            "key": "choice",
            "des": "blablabla",
            "range": [0, 10, 234, 5, 6]
        },
        "default": None,
        'required': True
    },
    {
        "name": "validation",
        "type": {
            "key": "float_m",
            "des": "blablabla",
            "range": [0.1, 10.1]
        },
        "default": None,
        'len_range': [2, 2],
        'required': False
    },
    {
        "name": "k",
        "type": {
            "key": "int_m",
            "des": "blablabla",
            "range": [0, 10]
        },
        "default": 2,
        'len_range': [2, 3],
        'required': False
    },
    {
        "name": "heheda",
        "type": {
            "key": "string_m",
            "des": "blablabla",
        },
        "default": "买了我的瓜",
        'len_range': None,
        'required': False
    },
    {
        "name": "validation",
        "type": {
            "key": "choice_m",
            "des": "blablabla",
            "range": [0, 10, 234, 5, 6],
        },
        "default": None,
        'len_range': None,
        'required': False
    },
    {
        'name': 'x_train',
        'type': {
            'key': 'data_set',
            "des": "blablabla",
        },
        "default": None,
        'required': True
    }
]