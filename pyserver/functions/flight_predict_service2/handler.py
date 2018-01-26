
# coding: utf-8

# In[1]:


# Please use current (work) folder to store your data and models
import os
# import sys
# sys.path.append('../')
import json
import pandas as pd

from function.modules import json_parser
from function.modules import Client

client = Client('fackAPI')
run = client.run
train = client.train
predict = client.predict


def handle(conf):
    weather_predict = predict('zhaofengli/weather_prediction', conf)
    weather_predict = pd.DataFrame([weather_predict])
    weather_predict = weather_predict.to_dict()
    result = predict('zhaofengli/flight_delay_prediction', weather_predict)
    # print(json.dumps({'result': result}))
    print(result.tolist())
