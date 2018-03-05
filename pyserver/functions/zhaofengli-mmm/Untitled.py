	
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
	# paste your code here
	
	
	
	
	
	conf = '[{"default":null,"des":"","name":"flight_no","range":null,"required":false,"type":"input","value":111,"value_type":"int"},{"default":null,"des":"","name":"flight_date","range":null,"required":false,"type":"input","value":1111,"value_type":"int"}]'
	conf = json_parser(conf)
	weather_predict = predict('zhaofengli/weather_prediction', conf)
	
	
	
	
	
	import pandas as pd
	
	weather_predict = pd.DataFrame([weather_predict])
	weather_predict = weather_predict.to_dict()
	
	
	
	
	
	# conf = '[{"default":null,"des":"","name":"DayofMonth,","range":null,"required":false,"type":"input","value":null,"value_type":"int"},{"default":null,"des":"","name":"DewPointFarenheit_x","range":null,"required":false,"type":"input","value":null,"value_type":"float"},{"default":null,"des":"","name":"DewPointCelsius_x","range":null,"required":false,"type":"input","value":null,"value_type":"float"},{"default":null,"des":"","name":"RelativeHumidity_x","range":null,"required":false,"type":"input","value":null,"value_type":"float"},{"default":null,"des":"","name":"WindSpeed_x","range":null,"required":false,"type":"input","value":null,"value_type":"float"},{"default":null,"des":"","name":"Altimeter_x","range":null,"required":false,"type":"input","value":null,"value_type":"float"},{"default":null,"des":"","name":"Visibility_y","range":null,"required":false,"type":"input","value":null,"value_type":"float"},{"default":null,"des":"","name":"DryBulbFarenheit_y","range":null,"required":false,"type":"input","value":null,"value_type":"float"},{"default":null,"des":"","name":"DryBulbCelsius_y","range":null,"required":false,"type":"input","value":null,"value_type":"float"},{"default":null,"des":"","name":"DewPointFarenheit_y","range":null,"required":false,"type":"input","value":null,"value_type":"float"},{"default":null,"des":"","name":"DewPointCelsius_y","range":null,"required":false,"type":"input","value":null,"value_type":"float"},{"default":null,"des":"","name":"DayOfWeek","range":null,"required":false,"type":"input","value":null,"value_type":"int"},{"default":null,"des":"","name":"RelativeHumidity_y","range":null,"required":false,"type":"input","value":null,"value_type":"float"},{"default":null,"des":"","name":"WindSpeed_y","range":null,"required":false,"type":"input","value":null,"value_type":"float"},{"default":null,"des":"","name":"Altimeter_y","range":null,"required":false,"type":"input","value":null,"value_type":"float"},{"default":null,"des":"","name":"OriginAirportID","range":null,"required":false,"type":"input","value":null,"value_type":"int"},{"default":null,"des":"","name":"DestAirportID","range":null,"required":false,"type":"input","value":null,"value_type":"int"},{"default":null,"des":"","name":"CRSDepTime","range":null,"required":false,"type":"input","value":null,"value_type":"int"},{"default":null,"des":"","name":"CRSArrTime","range":null,"required":false,"type":"input","value":null,"value_type":"int"},{"default":null,"des":"","name":"Visibility_x","range":null,"required":false,"type":"input","value":null,"value_type":"float"},{"default":null,"des":"","name":"DryBulbFarenheit_x","range":null,"required":false,"type":"input","value":null,"value_type":"float"},{"default":null,"des":"","name":"DryBulbCelsius_x","range":null,"required":false,"type":"input","value":null,"value_type":"float"}]'
	# conf = json_parser(conf)
	result = predict('zhaofengli/flight_delay_prediction', weather_predict)
	print(result.tolist())
	
