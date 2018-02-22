import os
import sys
import random

# sys.path.insert(0, os.path.abspath("../"))
sys.path.insert(0, os.path.dirname(__file__))


class weather_prediction(object):
    def __init__(self):
        '''
        :param feed:
        '''
        self.checkpoint_dir = os.path.dirname(__file__) + "/checkpoint"


    def train(self, feed={}):
        '''
        :param feed:
        :return:
        '''
        pass

    def predict(self, feed={}):
        '''
        :param feed:
        :return:
        '''
        flight_no = feed['flight_no']
        flight_date = feed['flight_date']

        seed = abs(hash(flight_no)) % (10 ** 8)
        random.seed(seed)
        result = {
            'Altimeter_x': random.uniform(10, 40),
            'Altimeter_y': random.uniform(10, 40),
            'CRSArrTime': random.randint(500, 1000),
            'CRSDepTime': random.randint(10, 100),
            'DayOfWeek': random.randint(0, 7),
            'DayofMonth': random.randint(0, 30),
            'DestAirportID': 13303,
            'DewPointCelsius_x': random.uniform(-10, 30),
            'DewPointCelsius_y': random.uniform(-10, 30),
            'DewPointFarenheit_x': random.uniform(30, 90),
            'DewPointFarenheit_y': random.uniform(30, 90),
            'DryBulbCelsius_x': random.uniform(0, 40),
            'DryBulbCelsius_y': random.uniform(0, 40),
            'DryBulbFarenheit_x': random.uniform(30, 90),
            'DryBulbFarenheit_y': random.uniform(30, 90),
            'OriginAirportID': 11433,
            'RelativeHumidity_x': random.uniform(50, 70),
            'RelativeHumidity_y': random.uniform(50, 70),
            'Visibility_x': random.uniform(0, 20),
            'Visibility_y': random.uniform(0, 20),
            'WindSpeed_x': random.uniform(10, 40),
            'WindSpeed_y': random.uniform(10, 40)
        }
        print('1111')
        return result

    def load_model(self):
        '''
        :param feed:
        :return:
        '''
        pass


# test = weather_prediction()
# data = {
#     'flight_no': 'U5555',
#     'flight_date': 3,
#     }
# result = test.predict(feed=data)
# print(result)
