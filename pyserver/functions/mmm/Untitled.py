
# coding: utf-8

# In[1]:



import os
import sys


from function.modules import json_parser
from function.modules import Client

client = Client('fackAPI', silent=True)
run = client.run
train = client.train
predict = client.predict


# In[ ]:

def handle(conf):
    conf = json_parser(conf)
    weather_predict = predict('zhaofengli/weather_prediction', conf)


    # In[ ]:


    weather_predict = pd.DataFrame([weather_predict])
    weather_predict = weather_predict.to_dict()


    # In[ ]:

    result = predict('zhaofengli/flight_delay_prediction', weather_predict)
    print(result.tolist())