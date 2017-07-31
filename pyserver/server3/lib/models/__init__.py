# -*- coding: UTF-8 -*-
# keras
from server3.lib.models.keras_seq import KERAS_SEQ_SPEC
from server3.lib.models.keras_seq import keras_seq
from server3.lib.models.keras_seq import keras_seq_to_str
# mlp
from server3.lib.models.mlp import mlp
from server3.lib.models.mlp import MLP
from server3.lib.models.mlp import mlp_to_str
# image classifier
from server3.lib.models.image_classifier import IMAGE_CLASSIFIER
from server3.lib.models.image_classifier import image_classifier
from server3.lib.models.image_classifier import image_classifier_to_str
# convnet
from server3.lib.models.convnet import convnet
from server3.lib.models.convnet import CONVNET
from server3.lib.models.convnet import convnet_to_str
# custom model
from server3.lib.models.custom_model import custom_model
from server3.lib.models.custom_model import custom_model_to_str
## svm
from server3.lib.models.svm import SVM
from server3.lib.models.svm import svm_model_fn
## kmean
from server3.lib.models.kmean import kmeans_clustering_model_fn
from server3.lib.models.kmean import Kmeans
## linear
from server3.lib.models.linear_classifier import linear_classifier_model_fn
from server3.lib.models.linear_classifier import LinearClassifier
from server3.lib.models.linear_regression import linear_regression_model_fn
from server3.lib.models.linear_regression import LinearRegression

from server3.lib.models.linear_regressor import linear_regressor_model_fn
from server3.lib.models.linear_regressor import linear_regressor_to_str
from server3.lib.models.linear_regressor import LinearRegressor


from server3.lib.models.keras_callbacks import MongoModelCheckpoint
