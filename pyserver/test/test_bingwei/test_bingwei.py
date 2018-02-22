# -*- coding: UTF-8 -*-

from urllib.request import Request, urlopen
from urllib import parse
from base64 import b64encode
import json

def test():
    import requests
    url = "https://api.sms.jpush.cn/v1/codes"
    payload = json.dumps({
        'mobile': "15988731660",
        'temp_id': 1,
    })

    # payload = "{\"mobile\":\"15988731660\",\"temp_id\":1}"
    headers = {
        'content-type': "application/json",
        'authorization': "Basic MjZlZWFhM2QyNzljMzIyZTg0Zjk1NDQxOmYwMjQ2NzdiOWNjM2QxZWZmNDE0ODQxMA==",
        # 'cache-control': "no-cache",
        # 'postman-token': "90592fd0-3861-97cf-6638-d863a8638e22"
    }

    response = requests.request("POST", url, data=payload, headers=headers)
    msg_id = response.json()["msg_id"]
    print("msg_id", msg_id)

if __name__ == '__main__':
    # appKey = '26eeaa3d279c322e84f95441'
    # masterSecret = 'f024677b9cc3d1eff4148410'
    # auth_string = appKey + ':' + masterSecret
    # params = {
    #     'mobile': 15988731660,
    #     'temp_id': 1,
    # }
    # data = bytes(parse.urlencode(params), encoding='utf8')
    # # userAndPass = b64encode(b"26eeaa3d279c322e84f95441:f024677b9cc3d1eff4148410").decode("ascii")
    # req = Request('https://api.sms.jpush.cn/v1/codes',
    #               data=data,
    #               headers={
    #                   'Content-Type': 'application/json',
    #                   'authorization': "Basic MjZlZWFhM2QyNzljMzIyZTg0Zjk1NDQxOmYwMjQ2NzdiOWNjM2QxZWZmNDE0ODQxMA==",
    #                   # 'Access-Control-Allow-Origin': '*',
    #               }
    #               )
    # print("req", req)
    # resp = urlopen(req)
    # print("req", req)
    # content = resp.read()
    # print("content", content)
    test()

# from server3.service.model_service import run_multiple_model

# hyper_parameters = {
#     # 训练周期数（epochs）和批大小（batch_size）调优
#     "epochs": [10, 50],
#     "batch_size": [10, 20],
#     # 优化器选择
#     "optimizer": ["SGD", "RMSprop", "Adam"],
#     # SGD 学习比率（rate) 和动量（momentum）参数调优
#     "lr": [0.05],
#     "momentum": [0],
#
#     # # 隐含层神经元数量调优
#     # "units": [20, 40],
#     # # 激活函数类型调优
#     # "activation": ["relu"],
#     # # 权重初始化类型调优
#     # "init": ["uniform"],
#     # # 抽稀层节点去除比例调优
#     # "rate": [0.0],
#
#     # 暂无
#     # "weight_constraint": [0],
#
#
#     # 不太需要针对优化器调整，学习速率和动量，
#     # "compile": {"loss": "categorical_crossentropy",
#     #             "optimizer": [{"name": "SGD",
#     #                           "args": {"lr": 0.01, "momentum": 0}},
#     #                           {"name": "adam"}
#     #                           ],
#     #             "metrics": ["accuracy"]
#     #             },
#
#     "layers": [
#         {"name": "Dense",
#          "args": {"units": [64, 128], "activation": "relu",
#                   "input_shape": [
#                       20],
#                   "init": "uniform"
#                   }
#          },
#         {"name": "Dropout",
#          "args": {"rate": [0.5, 0.6]}},
#         {"name": "Dense",
#          "args": {"units": 64, "activation": "relu"}},
#         {"name": "Dropout",
#          "args": {"rate": 0.5}},
#         {"name": "Dense",
#          "args": {"units": 10, "activation": "softmax"}}
#     ],
# }

#
# # layer 层参数
# # init_mode, activation, dropout_rate, weight_constraint, neurons
#
#
# def generate_conf():
#     # 获取数据
#     from keras import utils
#     import numpy as np
#     x_train = np.random.random((1000, 20))
#     y_train = utils.to_categorical(np.random.randint(10, size=(1000, 1)),
#                                    num_classes=10)
#     x_test = np.random.random((100, 20))
#     y_test = utils.to_categorical(np.random.randint(10, size=(100, 1)),
#                                   num_classes=10)
#     # x_train = []
#     # y_train = []
#     # x_test = []
#     # y_test = []
#     TEST_CONF = {"layers": [{"name": "Dense",
#                              "args": {"units": 64, "activation": "relu",
#                                       "input_shape": [
#                                           20, ],
#                                       "init": "uniform"
#                                       }
#                              },
#                             {"name": "Dropout",
#                              "args": {"rate": 0.5}},
#                             {"name": "Dense",
#                              "args": {"units": 64, "activation": "relu"}},
#                             {"name": "Dropout",
#                              "args": {"rate": 0.5}},
#                             {"name": "Dense",
#                              "args": {"units": 10, "activation": "softmax"}}
#                             ],
#                  "compile": {"loss": "categorical_crossentropy",
#                              "optimizer": {"name": "SGD",
#                                            "args": {"lr": 0.01, "momentum": 0}},
#                              "metrics": ["accuracy"]
#                              },
#                  "fit": {"x_train": x_train,
#                          "y_train": y_train,
#                          "x_val": x_test,
#                          "y_val": y_test,
#                          "args": {
#                              "epochs": 20,
#                              "batch_size": 128
#                          }
#                          },
#                  "evaluate": {"x_test": x_test,
#                               "y_test": y_test,
#                               "args": {
#                                   "batch_size": 128
#                               }
#                               }
#                  }
#     # question: is the value of batch size same as the fit
#     return TEST_CONF
#
#
# if __name__ == "__main__":
#     result = run_multiple_model(generate_conf(), None, None, None,
#                                 hyper_parameters=hyper_parameters)
#     for r in result:
#         print(r)
#
#
#
#
#
#
#
# test = {
#     "conf": {
#         "layers": [
#             {
#                 "name": "Dense",
#                 "args": {
#                     "units": {
#                         "distribute": "uniform",
#                         "value": "0, 1"
#                     },
#                     "activation": {
#                         "distribute": "choice",
#                         "value": ["relu"]
#                     },
#                     "input_shape": [
#                         3
#                     ]
#                 },
#                 "index": 0
#             },
#             {
#                 "name": "Dropout",
#                 "args": {
#                     "rate": {
#                         "distribute": "choice",
#                         "value": "0.1, 0.2, 0.4"
#                     }
#                 },
#                 "index": 1
#             },
#             {
#                 "name": "Dense",
#                 "args": {
#                     "units": 64,
#                     "activation": "softmax"
#                 },
#                 "index": 2
#             }
#         ],
#         "compile": {
#             "args": {
#                 "loss": [
#                     "categorical_crossentropy",
#                     "hinge"
#                 ],
#                 "optimizer": {
#                     "hyped": True,
#                     "name": "SGD",
#                     "range": [
#                         {
#                             "distribute": {
#                                 "name": "distribute_choice",
#                                 "type": {
#                                     "des": "distribute choice for hyperparameters tuning",
#                                     "key": "choice",
#                                     "range": [
#                                         {
#                                             "default": "0, 1",
#                                             "eg": "0, 1",
#                                             "name": "uniform",
#                                             "type": {
#                                                 "des": "Uniform distribution, Returns a value uniformly between low and high.",
#                                                 "key": "join_low_high"
#                                             }
#                                         },
#                                         {
#                                             "default": None,
#                                             "eg": [
#                                                 256,
#                                                 512,
#                                                 1024
#                                             ],
#                                             "name": "choice",
#                                             "type": {
#                                                 "des": "Choice distribution, Returns one of the options, which should be a list or tuple.",
#                                                 "key": "multiple"
#                                             }
#                                         }
#                                     ]
#                                 }
#                             },
#                             "name": "lr",
#                             "type": {
#                                 "des": "the learning rate of NN optimizers",
#                                 "key": "float"
#                             }
#                         },
#                         {
#                             "distribute": {
#                                 "name": "distribute_choice",
#                                 "type": {
#                                     "des": "distribute choice for hyperparameters tuning",
#                                     "key": "choice",
#                                     "range": [
#                                         {
#                                             "default": "0, 1",
#                                             "eg": "0, 1",
#                                             "name": "uniform",
#                                             "type": {
#                                                 "des": "Uniform distribution, Returns a value uniformly between low and high.",
#                                                 "key": "join_low_high"
#                                             }
#                                         },
#                                         {
#                                             "default": None,
#                                             "eg": [
#                                                 256,
#                                                 512,
#                                                 1024
#                                             ],
#                                             "name": "choice",
#                                             "type": {
#                                                 "des": "Choice distribution, Returns one of the options, which should be a list or tuple.",
#                                                 "key": "multiple"
#                                             }
#                                         }
#                                     ]
#                                 }
#                             },
#                             "name": "momentum",
#                             "type": {
#                                 "des": "the learning rate of NN optimizers",
#                                 "key": "float"
#                             }
#                         }
#                     ],
#                     "args": {
#                         "lr": {
#                             "hyped": True,
#                             "range": [
#                                 {
#                                     "default": "0, 1",
#                                     "eg": "0, 1",
#                                     "name": "uniform",
#                                     "type": {
#                                         "des": "Uniform distribution, Returns a value uniformly between low and high.",
#                                         "key": "join_low_high"
#                                     }
#                                 },
#                                 {
#                                     "default": None,
#                                     "eg": [
#                                         256,
#                                         512,
#                                         1024
#                                     ],
#                                     "name": "choice",
#                                     "type": {
#                                         "des": "Choice distribution, Returns one of the options, which should be a list or tuple.",
#                                         "key": "multiple"
#                                     }
#                                 }
#                             ],
#                             "args": {
#                                 "uniform": "0, 1",
#                                 "selected": "uniform"
#                             }
#                         },
#                         "momentum": 10
#                     }
#                 },
#                 "metrics": [
#                     "acc"
#                 ],
#                 "hype_loss": True
#             }
#         },
#         "fit": {
#             "data_fields": [
#                 [
#                     "alm",
#                     "erl",
#                     "gvh"
#                 ],
#                 [
#                     "mit",
#                     "nuc"
#                 ]
#             ],
#             "args": {
#                 "batch_size": 100,
#                 "epochs": 10
#             }
#         },
#         "evaluate": {
#             "args": {
#                 "batch_size": 100
#             }
#         }
#     },
#     "project_id": "598accd4e89bdeaf80e7206f",
#     "staging_data_set_id": "598af547e89bdec0f544b427",
#     "schema": "seq"
# }
#
#
# test12 = {
#     "conf":{
#         "layers":[
#             {
#                 "name":"Dense",
#                 "args":{
#                     "units":{
#                         "distribute":"uniform",
#                         "value":"0, 64"
#                     },
#                     "activation":{
#                         "distribute":"choice",
#                         "value":[
#                             "linear",
#                             "relu"
#                         ]
#                     },
#                     "input_shape":[
#                         4
#                     ]
#                 },
#                 "index":0
#             },
#             {
#                 "name":"Dropout",
#                 "args":{
#                     "rate":{
#                         "distribute":"uniform",
#                         "value":"0, 0.5"
#                     }
#                 },
#                 "index":1
#             }
#         ],
#         "compile":{
#             "args":{
#                 "loss":{
#                     "distribute":"choice",
#                     "value":[
#                         "categorical_crossentropy",
#                         "squared_hinge"
#                     ]
#                 },
#                 "optimizer":{
#                     "hyped":true,
#                     "name":"SGD",
#                     "range":[
#                         {
#                             "distribute":{
#                                 "name":"distribute_choice",
#                                 "type":{
#                                     "des":"distribute choice for hyperparameters tuning",
#                                     "key":"choice",
#                                     "range":[
#                                         {
#                                             "default":"0, 1",
#                                             "eg":"0, 1",
#                                             "name":"uniform",
#                                             "type":{
#                                                 "des":"Uniform distribution, Returns a value uniformly between low and high.",
#                                                 "key":"join_low_high"
#                                             }
#                                         },
#                                         {
#                                             "default":null,
#                                             "eg":[
#                                                 256,
#                                                 512,
#                                                 1024
#                                             ],
#                                             "name":"choice",
#                                             "type":{
#                                                 "des":"Choice distribution, Returns one of the options, which should be a list or tuple.",
#                                                 "key":"multiple"
#                                             }
#                                         }
#                                     ]
#                                 }
#                             },
#                             "name":"lr",
#                             "type":{
#                                 "des":"the learning rate of NN optimizers",
#                                 "key":"float"
#                             }
#                         },
#                         {
#                             "distribute":{
#                                 "name":"distribute_choice",
#                                 "type":{
#                                     "des":"distribute choice for hyperparameters tuning",
#                                     "key":"choice",
#                                     "range":[
#                                         {
#                                             "default":"0, 1",
#                                             "eg":"0, 1",
#                                             "name":"uniform",
#                                             "type":{
#                                                 "des":"Uniform distribution, Returns a value uniformly between low and high.",
#                                                 "key":"join_low_high"
#                                             }
#                                         },
#                                         {
#                                             "default":null,
#                                             "eg":[
#                                                 256,
#                                                 512,
#                                                 1024
#                                             ],
#                                             "name":"choice",
#                                             "type":{
#                                                 "des":"Choice distribution, Returns one of the options, which should be a list or tuple.",
#                                                 "key":"multiple"
#                                             }
#                                         }
#                                     ]
#                                 }
#                             },
#                             "name":"momentum",
#                             "type":{
#                                 "des":"the learning rate of NN optimizers",
#                                 "key":"float"
#                             }
#                         }
#                     ],
#                     "args":{
#                         "lr":0.01,
#                         "momentum":{
#                             "uniform":"0, 10",
#                             "distribute":"uniform"
#                         }
#                     }
#                 },
#                 "metrics":[
#                     "acc"
#                 ]
#             }
#         },
#         "fit":{
#             "data_fields":[
#                 [
#                     "alm",
#                     "erl",
#                     "gvh",
#                     "mcg"
#                 ],
#                 [
#                     "mit",
#                     "nuc"
#                 ]
#             ],
#             "args":{
#                 "batch_size":128,
#                 "epochs":10
#             }
#         },
#         "evaluate":{
#             "args":{
#                 "batch_size":128
#             }
#         }
#     },
#     "project_id":"598b0222e89bdec0f544be60",
#     "staging_data_set_id":"598b023ee89bdec0f544be62",
#     "schema":"seq",
#     "divide_row":1000
# }
