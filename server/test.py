# -*- coding: UTF-8 -*-
import sys
from os import path
sys.path.append(path.dirname(path.dirname(path.abspath(__file__))))

from datetime import datetime

from server.model import test_mongo_engine
from server.database import general


ds_name = 'test_data_set2'
# TODO maybe should get the instances in database, need to research
ds_class = test_mongo_engine.DataSet
data_class = test_mongo_engine.Data

# create one data set
general.save_one(ds_class, name=ds_name)

# find the data set
ds = general.find_one(ds_class, name=ds_name)

# add data to data set
general.save_one(data_class, time=datetime.utcnow(), value=2.0,
                 data_set=ds)

# general.modify(data_class, value=1.0, set__value=2.0)
