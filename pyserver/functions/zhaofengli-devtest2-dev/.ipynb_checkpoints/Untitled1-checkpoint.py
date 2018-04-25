	
# coding: utf-8
	
	
	
	

import os
import sys

	
from function.modules import json_parser
from function.modules import Client
	
client = Client('fackAPI', silent=True)
run = client.run
train = client.train
predict = client.predict
	
# append work_path to head when you want to reference a path inside the working directory
work_path = ''

def handle(conf):
	
	
    import json
    print(json.dumps({'flight_no': 1}))
	
	
	
	
