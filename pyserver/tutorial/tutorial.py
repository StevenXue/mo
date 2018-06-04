
# You can use other public modules via our Client object with module's identifier
# and parameters.
# For more detailes, please see our online document - https://momodel.github.io/mo/#
	
import os
import sys
	

	
# Import necessary packages
from function.modules import json_parser
from function.modules import Client
	
# Initialise Client object
client = Client(api_key='5asdfoasd0fnd0983', project_id='5af2abafe13823a5f1687062', user_ID='zhaofengli',
                project_type='app', source_file_path='3_Develop_and_Deploy_your_first_App.ipynb', silent=True)
	
# Make run/train/predict commnad alias for furthur use
run = client.run
train = client.train
predict = client.predict
	
# Run a importred module
# e.g.
#      conf = json_parser('{"rgb_image":null,"gray_image":null}')
#      result = run('zhaofengli/new_gender_classifier/0.0.2', conf)
#
# 'conf' is the parameters in dict form for the imported module
# '[user_id]/[imported_module_name]/[version]' is the identifier of the imported module
	
	
# Make controller alias for further use
controller = client.controller
	
# IMPORTANT: Add 'work_path' to the head of every file path in your code.
# e.g.
#      jpgfile = Image.open(work_path + "picture.jpg")
work_path = '\./'
def handle(conf):
	# paste your code here
	result = run('zhaofengli/iris_classifier_toolkit/1.0.0', conf)
	iris_class=['setosa','versicolor','virginica']
	result = iris_class[result[0]]
	return {'iris_classifier_toolkit_class':result}


if __name__ == '__main__':
	conf = {}
	handle(conf)