from uuid import getnode as get_mac
UPDATE_USER_INFO_SK = 'secret_mo_mo'
MONGO = 'DEFAULT'
# if get_mac() == 274973436731254:
#     MONGO = 'DEFAULT'
PORT = 5005
FILL_BLANK = 'BLANK_GRID'
ALLOWED_EXTENSIONS = {'zip', 'csv', 'png', 'jpg', 'jpeg', 'svg', 'txt', 'py',
                      'pyc',
                      'md', 'h5', 'npz', 'pkl', 'pdf', 'doc', 'docx', 'yml'}
PREDICT_FOLDER = 'predict_data/'
MODEL_EXPORT_BASE = '/tmp'
MODEL_SCRIPT_PATH = './run_model.py'
SERVING_PORT = 9000
REDIS_SERVER = 'redis://10.52.14.182:6379'
GIT_SERVER = 'http://10.52.14.182:2333'
GIT_SERVER_IP = '10.52.14.182'
WEB_ADDR = 'http://momodel.ai'
DOCKER_IP = '127.0.0.1'
GIT_LOCAL = f'root@{GIT_SERVER_IP}:'
# REDIS_SERVER = 'redis://localhost:6379'
HUB_SERVER = 'http://localhost:8000'
ADMIN_TOKEN = '1d4afa72b00c4ffd9db82f26e1628f89'
USER_DIR = './user_directory'
NAMESPACE = 'default'
KUBE_NAME = {
    'model': '{job_id}-training-job',
    'jupyter': '{project_id}-jupyter',
    'serving': '{job_id}-serving'
}
MODULE_DIR = './server3/lib/modules'
DEV_DIR_NAME = 'dev'
APP_DIR = './functions'
# INIT_RES = [
#     r"# coding: utf-8",
#     r"import os",
#     r"import sys",
#     r"# Please use current \(work\) folder to store your data and models",
#     r"sys.path.append\('(.+)'\)",
#     r"client = Client\('(.+)', project_id='(.+)', user_ID='(.+)',",
#     r"(\s+)project_type='(.+)', source_file_path='(.+)'\)",
#     r"from modules import (.+)",
#     r"(\S+) = client\.(\S+)",
#     r"# append work_path to head when you want to reference a path inside "
#     r"the working directory",
#     r"work_path = ''",
# ]
INIT_RES = [
    r'# You can use other public modules via our Client object with module\'s identifier \n',
    r'# and parameters.\n',
    r'# For more detailes, please see our online document - https://momodel.github.io/mo/#\n',
    r'\n',
    r'import os\n',
    r'import sys\n',
    r'\n',
    r'# Define root path\n',
    r'sys.path.append(\'../\')\n',
    r'\n',
    r'# Import necessary packages\n',
    r'from modules import json_parser\n',
    r'from modules import Client\n',
    r'\n',
    r'# Initialise Client object\n',
    r'client = Client(key=\'5asdfoasd0fnd0983\', project_id=\'5ae0c6ae0c11f30f76b7060d\', \n',
    r'                user_ID=\'zhaofengli\', \n',
    r'                project_type=\'app\', source_file_path=\'Untitled.ipynb\')\n',
    r'\n',
    r'# Make run/train/predict commnad alias for furthur use\n',
    r'run = client.run\n',
    r'train = client.train\n',
    r'predict = client.predict\n',
    r'\n',
    r'# Run a importred module \n',
    r'# e.g. \n',
    r'#      conf = json_parser(\'{"rgb_image":null,"gray_image":null}\') \n',
    r'#      result = run(\'zhaofengli/new_gender_classifier/0.0.2\', conf)\n',
    r'#\n',
    r'# \'conf\' is the parameters in dict form for the imported module\n',
    r'# \'[user_id]/[imported_module_name]/[version]\' is the identifier of the imported module\n',
    r'\n',
    r'\n',
    r'# Make controller alias for further use\n',
    r'controller = client.controller\n',
    r'\n',
    r'# IMPORTANT: Add \'work_path\' to the head of every file path in your code.\n',
    r'# e.g.\n',
    r'#      jpgfile = Image.open(work_path + "picture.jpg") \n',
    r'work_path = \'./\'']

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
    },
    {
        'name': 'x_train',
        'type': {
            'key': 'join_low_high',
            "des": "blablabla",
            'range': [0, 1]
        },
        "default": "0, 1",
        'required': True
    },
    {
        'name': 'x_train',
        'type': {
            'key': 'multiple',
            "des": "blablabla",
            'range': ["aa", 1]
        },
        "default": None,
        'required': True
    },
    {
        'name': 'x_train',
        'type': {
            'key': 'chioce_child',
            "des": "blablabla",
            'range': ["aa", 1]
        },
        "default": None,
        'required': True
    }
]


class SPEC(object):
    value_type = ['int', 'float', 'str']
    general_spec = {
        'name': None,
        'display_name': None,
        'type': 'input',
        'value_type': 'int',
        'range': None,  # [2, None],
        "default": None,
        "required": False,
    }
    ui_spec = {
        'input': {
            **general_spec,
            'value': None,
        },

        "multiple_input": {
            **general_spec,
            "type": "multiple_input",
            'range': [2, None],
            "len_range": None,
            'values': [],
        },

        "choice": {
            **general_spec,
            "type": "choice",
            "range": [
                "aa",
                "bb",
                "cc",
            ],
            'value': None,
        },

        "multiple_choice": {
            **general_spec,
            "type": "multiple_choice",
            "range": [
                "aa",
                "bb",
                "cc",
            ],
            "len_range": None,
            'values': [],
        },

    }


class Error(Exception):
    pass


class Warning(Exception):
    pass


class ErrorMessage(Exception):
    no_match_apis = {
        "key": "无匹配服务",
        "hint_message": "提示：无匹配服务\n"
    }

    error_get_type = {
        "key": "错误的获取类型",
        "hint_message": "提示：错误的获取类型\n"
    }

    # verify_failed = {
    #     "key": "验证失败",
    #     'hint_message': '提示：验证失败\n'
    # }
