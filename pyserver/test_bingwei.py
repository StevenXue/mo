# -*- coding: UTF-8 -*-

from server3.service.model_service import run_multiple_model

hyper_parameters = {
    # 训练周期数（epochs）和批大小（batch_size）调优
    "epochs": [10, 50],
    "batch_size": [10, 20],
    # 优化器选择
    "optimizer": ["SGD", "RMSprop", "Adam"],
    # SGD 学习比率（rate) 和动量（momentum）参数调优
    "lr": [0.05],
    "momentum": [0],

    # # 隐含层神经元数量调优
    # "units": [20, 40],
    # # 激活函数类型调优
    # "activation": ["relu"],
    # # 权重初始化类型调优
    # "init": ["uniform"],
    # # 抽稀层节点去除比例调优
    # "rate": [0.0],

    # 暂无
    # "weight_constraint": [0],


    # 不太需要针对优化器调整，学习速率和动量，
    # "compile": {"loss": "categorical_crossentropy",
    #             "optimizer": [{"name": "SGD",
    #                           "args": {"lr": 0.01, "momentum": 0}},
    #                           {"name": "adam"}
    #                           ],
    #             "metrics": ["accuracy"]
    #             },

    "layers": [
        {"name": "Dense",
         "args": {"units": [64, 128], "activation": "relu",
                  "input_shape": [
                      20],
                  "init": "uniform"
                  }
         },
        {"name": "Dropout",
         "args": {"rate": [0.5, 0.6]}},
        {"name": "Dense",
         "args": {"units": 64, "activation": "relu"}},
        {"name": "Dropout",
         "args": {"rate": 0.5}},
        {"name": "Dense",
         "args": {"units": 10, "activation": "softmax"}}
    ],
}

# layer 层参数
# init_mode, activation, dropout_rate, weight_constraint, neurons


def generate_conf():
    # 获取数据
    from keras import utils
    import numpy as np
    x_train = np.random.random((1000, 20))
    y_train = utils.to_categorical(np.random.randint(10, size=(1000, 1)), num_classes=10)
    x_test = np.random.random((100, 20))
    y_test = utils.to_categorical(np.random.randint(10, size=(100, 1)), num_classes=10)
    # x_train = []
    # y_train = []
    # x_test = []
    # y_test = []
    TEST_CONF = {"layers": [{"name": "Dense",
                             "args": {"units": 64, "activation": "relu",
                                      "input_shape": [
                                          20, ],
                                      "init": "uniform"
                                      }
                             },
                            {"name": "Dropout",
                             "args": {"rate": 0.5}},
                            {"name": "Dense",
                             "args": {"units": 64, "activation": "relu"}},
                            {"name": "Dropout",
                             "args": {"rate": 0.5}},
                            {"name": "Dense",
                             "args": {"units": 10, "activation": "softmax"}}
                            ],
                 "compile": {"loss": "categorical_crossentropy",
                             "optimizer": {"name": "SGD",
                                           "args": {"lr": 0.01, "momentum": 0}},
                             "metrics": ["accuracy"]
                             },
                 "fit": {"x_train": x_train,
                         "y_train": y_train,
                         "x_val": x_test,
                         "y_val": y_test,
                         "args": {
                             "epochs": 20,
                             "batch_size": 128
                         }
                         },
                 "evaluate": {"x_test": x_test,
                              "y_test": y_test,
                              "args": {
                                  "batch_size": 128
                              }
                              }
                 }
    # question: is the value of batch size same as the fit
    return TEST_CONF


if __name__ == "__main__":
    result = run_multiple_model(generate_conf(), None, None, None, hyper_parameters=hyper_parameters)
    for r in result:
        print(r)

