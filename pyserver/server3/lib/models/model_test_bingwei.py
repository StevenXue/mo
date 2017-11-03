import numpy as np
import pandas as pd
from sklearn.datasets import load_boston
from sklearn.model_selection import train_test_split
from hyperopt import fmin, tpe, hp, STATUS_OK, Trials, rand, tpe, space_eval

from server3.lib.models.linear_regressor import linear_regressor_model_fn
from server3.lib.models import *
from server3.business import staging_data_set_business


boston = load_boston()
boston_feature = pd.DataFrame(data=np.c_[boston['data']],
                              columns=boston['feature_names'])
boston_label = pd.DataFrame(data=boston['target'],
                            columns=['target'])

# 测试 linear_regressor
X_train, X_test, y_train, y_test = train_test_split(
    boston_feature, boston_label,
    test_size=0.20,
    random_state=42)

input = {
    'model_name': 'linear_regressor',
    'x_tr': X_train,
    'x_te': X_test,
    'y_tr': y_train,
    'y_te': y_test,
}

params = {
    'estimator': {
        'args': {
            "dimension": 13,
            "weight_column_name": None,
            "gradient_clip_norm": None,
            "enable_centered_bias": False,
            "_joint_weight": False,
            "label_dimension": 1,
        }
    },
    'fit': {
        "args": {
            "steps": 1000
        }
    },
    'evaluate': {
        'args': {
            'steps': 1
        }
    }
}


def hyperopt_linear():
    def objective(args):
        steps = args
        params['fit']['args']['steps'] = steps
        sds = staging_data_set_business.get_by_id('595cb76ed123ab59779604c3')
        result = custom_model(params, linear_regressor_model_fn, input, result_sds=sds)
        return result['eval_metrics']['loss']
    space = [hp.uniform('steps', 100, 110)]

    best = fmin(objective, space, algo=rand.suggest, max_evals=3)
    print("best space: ", space_eval(space, best))
    print("best : ", best)


if __name__ == '__main__':
    hyperopt_linear()


# {'eval_metrics': {'loss': 40.573746, 'global_step': 1000}}


