
# coding: utf-8

# In[1]:


# Please use current (work) folder to store your data and models
import os
# import sys
# sys.path.append('../')

from function.modules import json_parser
from function.modules import Client

client = Client('fackAPI')
run = client.run
train = client.train
predict = client.predict


def handle(conf):
    print(predict('zhaofengli/flight_delay_prediction', conf))