# -*- coding: UTF-8 -*-
import sys
import requests
from constants import PY_SERVER

project_id = sys.argv[1]
requests.post(
    f'{PY_SERVER}/project/commit_broadcast/' + project_id)
with open('./temp.log', 'w') as f:
    from datetime import datetime
    f.write(datetime.now().strftime("%b %d %Y %H:%M:%S")+':success')
