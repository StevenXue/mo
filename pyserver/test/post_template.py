hyperparameters = {
    "conf": {
        "layers": [
            {
                "name": "Dense",
                "args": {
                    "units": 64,
                    "activation": "relu",
                    "input_shape": [
                        20
                    ],
                    "init": "uniform"
                }
            },
            {
                "name": "Dropout",
                "args": {
                    "rate": 0.5
                }
            },
            {
                "name": "Dense",
                "args": {
                    "units": 64,
                    "activation": "relu"
                }
            },
            {
                "name": "Dropout",
                "args": {
                    "rate": 0.5
                }
            },
            {
                "name": "Dense",
                "args": {
                    "units": 10,
                    "activation": "softmax"
                }
            }
        ],
        "compile": {
            "loss": "categorical_crossentropy",
            "optimizer": {"name": "SGD","args": {"lr": 0.01, "momentum": 0}},
            "metrics": [
                "acc"
            ]
        },
        "fit": {
            "x_train": [
                "field0",
                "field1",
                "field10",
                "field11",
                "field12",
                "field13",
                "field14",
                "field15",
                "field16",
                "field17",
                "field18",
                "field19",
                "field2",
                "field3",
                "field4",
                "field5",
                "field6",
                "field7",
                "field8",
                "field9"
            ],
            "y_train": [
                "field20",
                "field21",
                "field22",
                "field23",
                "field24",
                "field25",
                "field26",
                "field27",
                "field28",
                "field29"
            ],
            "x_val": [
                "field0",
                "field1",
                "field10",
                "field11",
                "field12",
                "field13",
                "field14",
                "field15",
                "field16",
                "field17",
                "field18",
                "field19",
                "field2",
                "field3",
                "field4",
                "field5",
                "field6",
                "field7",
                "field8",
                "field9"
            ],
            "y_val": [
                "field20",
                "field21",
                "field22",
                "field23",
                "field24",
                "field25",
                "field26",
                "field27",
                "field28",
                "field29"
            ],
            "args": {
                "batch_size": 128,
                "epochs": 20
            }
        },
        "evaluate": {
            "x_test": [
                "field0",
                "field1",
                "field10",
                "field11",
                "field12",
                "field13",
                "field14",
                "field15",
                "field16",
                "field17",
                "field18",
                "field19",
                "field2",
                "field3",
                "field4",
                "field5",
                "field6",
                "field7",
                "field8",
                "field9"
            ],
            "y_test": [
                "field20",
                "field21",
                "field22",
                "field23",
                "field24",
                "field25",
                "field26",
                "field27",
                "field28",
                "field29"
            ],
            "args": {
                "batch_size": 128
            }
        }
    },
    "project_id": "595f32e4e89bde8ba70738a3",
    "staging_data_set_id": "595caef1e89bde15d37530f3",
    "schema": "seq",

    "hyper_parameters": {
        "epochs": [10, 50],
        "batch_size": [10],
        "optimizer": ["SGD"],
        "lr": [0.05],
        "momentum": [0],
        "layers": [
            {"name": "Dense",
             "args": {"units": [64], "activation": "relu",
                      "input_shape": [
                          20],
                      "init": "uniform"
                      }
             },
            {"name": "Dropout",
             "args": {"rate": [0.5]}},
            {"name": "Dense",
             "args": {"units": 64, "activation": "relu"}},
            {"name": "Dropout",
             "args": {"rate": 0.5}},
            {"name": "Dense",
             "args": {"units": 10, "activation": "softmax"}}
        ]
    }
}