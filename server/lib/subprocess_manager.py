#!/usr/bin/python
# -*- coding: UTF-8 -*-
"""
# @author   : Tianyi Zhang
# @version  : 1.0
# @date     : 2017-06 17:00pm
# @function : Getting all of the toolkit of statics analysis
# @running  : python
# Further to FIXME of None
"""

import sys
from bson.objectid import ObjectId

from server.business import job_business, model_business, result_business
from service import job_service, model_service
from utility import json_utility, data_utility

# 使得 sys.get default encoding() 的值为 'utf-8'
reload(sys)                      # reload 才能调用 set default encoding 方法
sys.setdefaultencoding('utf-8')  # 设置 'utf-8'



if __name__ == '__main__':
    pass