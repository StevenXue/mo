import os
import sys
from sklearn.base import BaseEstimator, TransformerMixin
# from sklearn.pipeline import FeatureUnion
# from sklearn.preprocessing import Imputer
# from sklearn.pipeline import Pipeline
# from sklearn.preprocessing import StandardScaler
# # from sklearn.preprocessing import CategoricalEncoder
# from sklearn.preprocessing import OneHotEncoder
# from sklearn.preprocessing import LabelEncoder
# from sklearn.linear_model import LogisticRegression
import pandas as pd
import numpy as np
from sklearn.externals import joblib

# sys.path.insert(0, os.path.abspath("../"))
sys.path.insert(0, os.path.dirname(__file__))


class flight_delay_prediction(object):
    def __init__(self):
        '''
        :param feed:
        '''
        self.checkpoint_dir = os.path.dirname(__file__) + "/checkpoint"
        self.num_pipeline = None
        self.cat_pipeline = None
        self.log_reg = None

    def train(self, feed={}):
        '''
        :param feed:
        :return:
        '''
        data = feed['data_path'] + "/data.csv"
        data = pd.read_csv(data)
        labeldata = data['ArrDel15']
        data = data.drop(['ArrDel15'], axis=1)

        allfeatures = list(data.columns.values)
        cat_attribs = ["OriginAirportID", "DestAirportID"]
        num_attribs = [i for i in allfeatures if i not in cat_attribs]
        self.load_model()

        data_num_prepared = self.num_pipeline.fit_transform(data[num_attribs].values)
        data_cat_prepared = self.cat_pipeline.fit_transform(data[cat_attribs].values)
        data_prepared = np.concatenate(
            (data_num_prepared, data_cat_prepared.toarray()), axis=1)
        self.log_reg.fit(data_prepared, labeldata.values)

        joblib.dump(self.num_pipeline, feed[
            'data_path']+'/demo_num_pipeline.pkl')
        joblib.dump(self.cat_pipeline, feed[
            'data_path']+'/demo_cat_pipeline.pkl')
        joblib.dump(self.log_reg, feed['data_path']+'/demo_model.pkl')
        # print('train ok')

    def predict(self, feed={}):
        '''

        :param feed:
        :return:
        '''
        self.load_model()
        predict_data = pd.DataFrame(feed)
        allfeatures = list(predict_data.columns.values)
        cat_attribs = ["OriginAirportID", "DestAirportID"]
        num_attribs = [i for i in allfeatures if i not in cat_attribs]

        data_num_prepared = self.num_pipeline.transform(predict_data[num_attribs].values)
        data_cat_prepared = self.cat_pipeline.transform(predict_data[cat_attribs].values)
        data_prepared = np.concatenate(
            (data_num_prepared, data_cat_prepared.toarray()), axis=1)
        result = self.log_reg.predict(data_prepared)
        return result

    def load_model(self):
        '''
        :param feed:
        :return:
        '''
        self.num_pipeline = joblib.load(self.checkpoint_dir + '/demo_num_pipeline.pkl')
        self.cat_pipeline = joblib.load(self.checkpoint_dir + '/demo_cat_pipeline.pkl')
        self.log_reg = joblib.load(self.checkpoint_dir + '/demo_model.pkl')
        # print('model load ok')


# test = flight_delay_prediction()
# data = {'Altimeter_x': {0: 29.59},
#  'Altimeter_y': {0: 30.030000000000001},
#  'CRSArrTime': {0: 1138},
#  'CRSDepTime': {0: 8},
#  'DayOfWeek': {0: 5},
#  'DayofMonth': {0: 19},
#  'DestAirportID': {0: 13303},
#  'DewPointCelsius_x': {0: -1.1000000000000001},
#  'DewPointCelsius_y': {0: 21.0},
#  'DewPointFarenheit_x': {0: 30.0},
#  'DewPointFarenheit_y': {0: 70.0},
#  'DryBulbCelsius_x': {0: 6.0999999999999996},
#  'DryBulbCelsius_y': {0: 30.0},
#  'DryBulbFarenheit_x': {0: 43.0},
#  'DryBulbFarenheit_y': {0: 86.0},
#  'OriginAirportID': {0: 11433},
#  'RelativeHumidity_x': {0: 60.0},
#  'RelativeHumidity_y': {0: 59.0},
#  'Visibility_x': {0: 10.0},
#  'Visibility_y': {0: 10.0},
#  'WindSpeed_x': {0: 34.0},
#  'WindSpeed_y': {0: 17.0}}
# result = test.predict(feed=data)
# print(result)