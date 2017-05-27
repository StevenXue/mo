# -*- coding: UTF-8 -*-
import sys
from service import staging_data_service


# 使得 sys.getdefaultencoding() 的值为 'utf-8'
reload(sys)                      # reload 才能调用 setdefaultencoding 方法
sys.setdefaultencoding('utf-8')  # 设置 'utf-8'


def list_staging_data_set(project_id):
    sd_objects = staging_data_service.list_staging_data_sets_by_project_id(project_id)
    print [obj.to_mongo().to_dict() for obj in sd_objects]


