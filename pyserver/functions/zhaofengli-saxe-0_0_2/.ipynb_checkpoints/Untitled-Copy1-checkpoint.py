	
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
	
	
	
	
	
	conf = '{"DayofMonth":1}'
	conf = json_parser(conf)
	print(conf)
	
	
	
	
	
	result = run('zhaofengli/newttt/0.0.1', conf)
	result
	
	
	
	
	
	conf = '{"DayofMonth":2}'
	conf = json_parser(conf)
	print(conf)
	
	
	
	
	
	result = run('zhaofengli/newttt/0.0.2', conf)
	
	
	# In[ ]:
	
	
	
	
