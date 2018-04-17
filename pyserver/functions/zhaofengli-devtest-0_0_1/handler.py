	
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
	
	
	# In[ ]:
    import json
    print(json.dumps({'flight_no': 1}))
	
	
	
	
