
# coding: utf-8





import os
import sys


from function.modules import json_parser
from function.modules import Client

client = Client('fackAPI', silent=True)
run = client.run
train = client.train
predict = client.predict


def handle(conf):
    weather_predict = predict('zhaofengli/weather_prediction', conf)

    import pandas as pd

    weather_predict = pd.DataFrame([weather_predict])
    weather_predict = weather_predict.to_dict()


    result = predict('zhaofengli/flight_delay_prediction', weather_predict)
    print(result.tolist())
    






