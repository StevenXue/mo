# -*- coding: UTF-8 -*-
"""
spark server3.service used to access spark cluster

Author: Bingwei Chen
Date: 2017.07.11
"""
# ------------------------------ system package ------------------------------
import os
import sys

os.environ['PYSPARK_PYTHON'] = '/usr/local/bin/python3.6'
sys.path.append("/usr/local/spark/python")
from pyspark import SparkContext
from pyspark import SparkConf

from keras import layers
from keras.models import Sequential
import tensorflow as tf

# graph = tf.get_default_graph()
# ------------------------------ self package ------------------------------
# sys.path.append("/Users/chen/myPoject/gitRepo/goldersgreen/")
# sys.path.append("/root/project/git_repo/goldersgreen/server3")


# ------------------------------ const ------------------------------
SPARK_EXECUTOR_MEMORY = '4g'
SERVER3_PATH = "/Users/chen/myPoject/gitRepo/goldersgreen/pyserver/lib/server3.zip"
KERAS_SEQ_PATH = '/Users/chen/myPoject/gitRepo/goldersgreen/server3/lib/models/keras_seq.py'

MASTER_ADDRESS = "spark://10.52.14.188:7077"


# ------------------------------ code ------------------------------
def CreateSparkContext():
    sparkConf = SparkConf() \
        .setAppName("hyperparameter_tuning") \
        .set("spark.ui.showConsoleProgress", "false") \
        .setMaster(MASTER_ADDRESS) \
        .set("spark.executor.memory", SPARK_EXECUTOR_MEMORY)
    sc = SparkContext(conf=sparkConf, pyFiles=[SERVER3_PATH])
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
    def simple_keras_seq(conf, **kw):
        """
        a general implementation of sequential model of keras
        :param conf: config dict
        :return:
        """
        result_sds = kw.pop('result_sds', None)
        if result_sds is None:
            raise RuntimeError('no result sds id passed to model')

        model = Sequential()
        # Dense(64) is a fully-connected layer with 64 hidden units.
        # in the first layer, you must specify the expected input data shape:
        # here, 20-dimensional vectors.
        ls = conf['layers']
        comp = conf['compile']
        f = conf['fit']
        e = conf['evaluate']

        # TODO add validator
        # op = comp['optimizer']

        # loop to add layers
        for l in ls:
            # get layer class from keras
            layer_class = getattr(layers, l['name'])
            # add layer
            model.add(layer_class(**l['args']))

        # optimiser
        # sgd_class = getattr(optimizers, op['name'])
        # sgd = sgd_class(**op['args'])

        # define the metrics
        # compile
        model.compile(loss=comp['loss'],
                      optimizer=comp['optimizer'],
                      metrics=comp['metrics'])

        # training
        # TODO callback 改成异步，考虑 celery
        model.fit(f['x_train'], f['y_train'],
                  validation_data=(f['x_val'], f['y_val']),
                  verbose=0,
                  **f['args'])

        # testing
        score = model.evaluate(e['x_test'], e['y_test'], **e['args'])

        weights = model.get_weights()
        config = model.get_config()
        return score

    def model_training(parameter):
        # from py file import code (if it has dependency, using zip to access it)
        # from server3.lib.models.keras_seq import keras_seq

        # staging_data_set_id 595cb76ed123ab59779604c3
        # from server3.business.staging_data_set_business import get_by_id
        result = simple_keras_seq(parameter, result_sds="11")
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
