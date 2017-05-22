# -*- coding: UTF-8 -*-
import sys

from os import path

sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

# from server.entity.t_class import T_class

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
# user = User()
# print user_business.find_by_user_id({'user_id': 'test_user'})
