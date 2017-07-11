# -*- coding: UTF-8 -*-
"""
spark engine used to access spark cluster

Author: Bingwei Chen
Date: 2017.07.11
"""
# ------------------------------ system package ------------------------------
import sys
import os
os.environ['PYSPARK_PYTHON'] = '/usr/local/bin/python3.6'
sys.path.append("/usr/local/spark/python")
from pyspark import SparkContext
from pyspark import SparkConf


# ------------------------------ self package ------------------------------
# sys.path.append("/Users/chen/myPoject/gitRepo/goldersgreen/")
# sys.path.append("/root/project/git_repo/goldersgreen/server3")


# ------------------------------ const ------------------------------
SPARK_EXECUTOR_MEMORY = '4g'
SERVER3_PATH = "/Users/chen/myPoject/gitRepo/goldersgreen/zip/server3.zip"
KERAS_SEQ_PATH = '/Users/chen/myPoject/gitRepo/goldersgreen/server3/lib/models/keras_seq.py'

# ------------------------------ code ------------------------------

def CreateSparkContext():
    sparkConf = SparkConf() \
        .setAppName("hyperparameter_tuning") \
        .set("spark.ui.showConsoleProgress", "false") \
        .setMaster("spark://10.52.14.188:7077") \
        .set("spark.executor.memory", SPARK_EXECUTOR_MEMORY)
    sc = SparkContext(conf=sparkConf, pyFiles=[KERAS_SEQ_PATH])
    print("master = " + sc.master)
    SetLogger(sc)
    SetPath(sc)
    return (sc)


def SetLogger(sc):
    logger = sc._jvm.org.apache.log4j
    logger.LogManager.getLogger("org").setLevel(logger.Level.ERROR)
    logger.LogManager.getLogger("akka").setLevel(logger.Level.ERROR)
    logger.LogManager.getRootLogger().setLevel(logger.Level.ERROR)


def SetPath(sc):
    global Path
    Path = "file:/usr/local/spark/"


# for hyper parameters tuning
def hyper_parameters_tuning(parameters_grid):
    def model_training(parameter):
        # from py file import code (if it has dependency, using zip to access it)
        from keras_seq import keras_seq
        result = keras_seq(parameter, result_sds='11')
        return {
            "result": result,
            "epochs": parameter['fit']['args']['epochs'],
            "batch_size": parameter['fit']['args']['batch_size']
        }

    print("begin_hyper_parameters_tuning")
    # create spark context
    sc = CreateSparkContext()
    # parallelize parameters_grid to rdd
    rdd = sc.parallelize(parameters_grid, numSlices=len(parameters_grid))
    # run models on spark cluster
    results = rdd.map(lambda parameter: model_training(parameter))
    res = results.collect()
    return res


if __name__ == "__main__":
    # 获取数据
    from keras import utils
    import numpy as np
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
    hyper_parameters_tuning(parametersGrid)
    pass



