import os
import sys

sys.path.insert(0, os.path.dirname(__file__))


class sesese(object):
    def __init__(self):
        '''
        :param feed:
        '''
        self.checkpoint_dir = os.path.dirname(__file__) + "/checkpoint"

    def train(self, feed=None):
        '''
        :param feed:
        :return:
        '''
        if feed is None:
            feed = {}

    def predict(self, feed=None):
        '''

        :param feed:
        :return:
        '''
        if feed is None:
            feed = {}

    def load_model(self):
        '''
        :param feed:
        :return:
        '''

