# -*- coding: UTF-8 -*-
import sys
from os import path
sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

from datetime import datetime
from server.entity import data
from server.entity import data_set
from server.repository import general_repo
from server.service import user_service


# ds_name = 'test_data_set4'
# ds_class = data_set.DataSet
# data_class = data.Data
#
# # create one data set
# new_ds = {'name': ds_name, 'type': 'type1'}
# print general_repo.save_one(ds_class, new_ds)
#
# # find the data set
# ds = general_repo.find_one(ds_class, {'name': ds_name})
# print ds.name
#
# # add data to data set
# new_data = {'time': datetime.utcnow(), 'value': 22.0,
#             'data_set': ds}
# print new_data
# print general_repo.save_one(data_class, new_data)

# general.modify(data_class, value=1.0, set__value=2.0)
user_service.create_user()