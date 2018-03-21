# -*- coding: UTF-8 -*-
import sys
import requests

project_id = sys.argv[1]
requests.post(
    'http://10.52.22.14:5005/project/commit_broadcast/' + project_id)
    # 'http://10.52.17.70:5005/project/commit_broadcast/' + project_id)
with open('./temp.log', 'w') as f:
    from datetime import datetime
    f.write(datetime.now().strftime("%b %d %Y %H:%M:%S")+':success')
