"""

"""
# set spark path
import sys
sys.path.append("/usr/local/spark/python")
# sys.path.append("/root/project/git_repo/goldersgreen/server3")
# sys.path.append("/usr/local/spark/python/lib/py4j-0.10.4-src.zip")

# set PYSPARK_PYTHON path to python3
import os
os.environ["SPARK_HOME"] = "/usr/local/spark"
os.environ["PYSPARK_PYTHON"]="/usr/local/bin/python3.6"

# from pyspark import SparkContext
from pyspark.sql import SparkSession


from keras import utils
from lib.models import keras_seq

# Generate dummy data
import numpy as np


def hyper_parameters_tuning(parametersGrid, model=keras_seq):
	rdd = spark.sparkContext.parallelize(parametersGrid,  numSlices=len(parametersGrid))
	results = rdd.map(lambda parameter: model(parameter, result_sds='11'))
	print("results", results.collect())


if __name__ == '__main__':
	spark = SparkSession \
		.builder \
		.appName("hyperparameters") \
		.getOrCreate()

	# sc = spark.SparkContext

	print("begin_hyper_parameters_tuning")
	x_train = np.random.random((1000, 20))
	y_train = utils.to_categorical(np.random.randint(10, size=(1000, 1)), num_classes=10)
	x_test = np.random.random((100, 20))
	y_test = utils.to_categorical(np.random.randint(10, size=(100, 1)), num_classes=10)
	parametersGrid = [
		{'layers': [{'name': 'Dense',
		             'args': {'units': 64, 'activation': 'relu',
		                      'input_shape': [
			                      20, ]}},
		            {'name': 'Dropout',
		             'args': {'rate': 0.5}},
		            {'name': 'Dense',
		             'args': {'units': 64, 'activation': 'relu'}},
		            {'name': 'Dropout',
		             'args': {'rate': 0.5}},
		            {'name': 'Dense',
		             'args': {'units': 10, 'activation': 'softmax'}}
		            ],
		 'compile': {'loss': 'categorical_crossentropy',
		             'optimizer': 'SGD',
		             'metrics': ['accuracy']
		             },
		 'fit': {'x_train': x_train,
		         'y_train': y_train,
		         'x_val': x_test,
		         'y_val': y_test,
		         'args': {
			         'epochs': 20,
			         'batch_size': 128
		         }
		         },
		 'evaluate': {'x_test': x_test,
		              'y_test': y_test,
		              'args': {
			              'batch_size': 128
		              }
		              }
		 },

		{'layers': [{'name': 'Dense',
		             'args': {'units': 64, 'activation': 'relu',
		                      'input_shape': [
			                      20, ]}},
		            {'name': 'Dropout',
		             'args': {'rate': 0.5}},
		            {'name': 'Dense',
		             'args': {'units': 64, 'activation': 'relu'}},
		            {'name': 'Dropout',
		             'args': {'rate': 0.5}},
		            {'name': 'Dense',
		             'args': {'units': 10, 'activation': 'softmax'}}
		            ],
		 'compile': {'loss': 'categorical_crossentropy',
		             'optimizer': 'SGD',
		             'metrics': ['accuracy']
		             },
		 'fit': {'x_train': x_train,
		         'y_train': y_train,
		         'x_val': x_test,
		         'y_val': y_test,
		         'args': {
			         'epochs': 20,
			         'batch_size': 128
		         }
		         },
		 'evaluate': {'x_test': x_test,
		              'y_test': y_test,
		              'args': {
			              'batch_size': 128
		              }
		              }
		 }
	]
	hyper_parameters_tuning(parametersGrid, keras_seq)

