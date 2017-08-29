from keras.applications import vgg19
from keras import backend as K
from keras.models import Sequential
from keras.models import load_model
from keras.models import model_from_json
import tensorflow as tf


# global graph
graph = tf.get_default_graph()
