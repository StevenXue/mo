# -*- coding: UTF-8 -*-
# convnet
from server3.lib.models.convnet import CONVNET
from server3.lib.models.convnet import convnet
from server3.lib.models.convnet import convnet_to_str
# custom model
from server3.lib.models.custom_model import custom_model
from server3.lib.models.custom_model import custom_model_to_str
## gmm cluster
from server3.lib.models.gmm_cluster import GMMCluster
from server3.lib.models.gmm_cluster import gmm_cluster_model_fn
# image classifier
from server3.lib.models.image_classifier import IMAGE_CLASSIFIER
from server3.lib.models.image_classifier import image_classifier
from server3.lib.models.image_classifier import image_classifier_to_str
from server3.lib.models.keras_seq import KERAS_SEQ_SPEC
from server3.lib.models.keras_seq import keras_seq
from server3.lib.models.keras_seq import keras_seq_to_str
from server3.lib.models.kmeans_cluster import KmeansCluster
from server3.lib.models.kmeans_cluster import KmeansCluster
## kmean
from server3.lib.models.kmeans_cluster import kmeans_cluster_model_fn
from server3.lib.models.linear_classifier import LinearClassifier
## linear classifier
from server3.lib.models.linear_classifier import linear_classifier_model_fn
## linear regressor
from server3.lib.models.linear_regressor import linear_regressor_model_fn
## logistic regressor
from server3.lib.models.logistic_regressor import LogisticRegressor
from server3.lib.models.logistic_regressor import logistic_regressor_model_fn
from server3.lib.models.mlp import MLP
# mlp
from server3.lib.models.mlp import mlp
from server3.lib.models.mlp import mlp_to_str
# nn application
from server3.lib.models.nn.applications.image_classifier_inception_v3 import \
    IMAGE_CLASSIFIER_INCEPTION_V3
from server3.lib.models.nn.applications.image_classifier_inception_v3 import \
    image_classifier_inception_v3
from server3.lib.models.nn.applications.image_classifier_inception_v3 import \
    image_classifier_inception_v3_to_str
from server3.lib.models.nn.applications.image_classifier_resnet50 import \
    IMAGE_CLASSIFIER_RESNET50
from server3.lib.models.nn.applications.image_classifier_resnet50 import \
    image_classifier_resnet50
from server3.lib.models.nn.applications.image_classifier_resnet50 import \
    image_classifier_resnet50_to_str
from server3.lib.models.nn.applications.image_classifier_vgg16 import \
    IMAGE_CLASSIFIER_VGG16
from server3.lib.models.nn.applications.image_classifier_vgg16 import \
    image_classifier_vgg16
from server3.lib.models.nn.applications.image_classifier_vgg16 import \
    image_classifier_vgg16_to_str
from server3.lib.models.nn.applications.image_classifier_vgg19 import \
    IMAGE_CLASSIFIER_VGG19
from server3.lib.models.nn.applications.image_classifier_vgg19 import \
    image_classifier_vgg19
from server3.lib.models.nn.applications.image_classifier_vgg19 import \
    image_classifier_vgg19_to_str
from server3.lib.models.nn.applications.image_classifier_xception import \
    IMAGE_CLASSIFIER_XCEPTION
from server3.lib.models.nn.applications.image_classifier_xception import \
    image_classifier_xception
from server3.lib.models.nn.applications.image_classifier_xception import \
    image_classifier_xception_to_str
## randomforest
from server3.lib.models.randomforest import RandomForest
from server3.lib.models.randomforest import random_forest_model_fn
## svm
from server3.lib.models.svm import SVM
from server3.lib.models.svm import svm_model_fn


