import sys
import cv2
from keras.models import load_model
import numpy as np
from keras.preprocessing import image
import os
import sys

# sys.path.insert(0, os.path.abspath("../"))
sys.path.insert(0, os.path.dirname(__file__))


def preprocess_input(x, v2=True):
    x = x.astype('float32')
    x = x / 255.0
    if v2:
        x = x - 0.5
        x = x * 2.0
    return x


def apply_offsets(face_coordinates, offsets):
    x, y, width, height = face_coordinates
    x_off, y_off = offsets
    return (x - x_off, x + width + x_off, y - y_off, y + height + y_off)

def load_detection_model(model_path):
    detection_model = cv2.CascadeClassifier(model_path)
    return detection_model

def detect_faces(detection_model, gray_image_array):
    return detection_model.detectMultiScale(gray_image_array, 1.3, 5)


class new_gender_classifier(object):

    def __init__(self, input={}):
        '''

        :param input:
        '''
        self.checkpoint_dir = os.path.join(os.path.dirname(__file__),"checkpoint")

    def run(self, input={}):
        '''

        :param input:
        :return:
        '''
        # parameters for loading data and images
        rgb_image = input.get('rgb_image')
        gray_image = input.get('gray_image')

        detection_model_path = self.checkpoint_dir+'/detection_models/haarcascade_frontalface_default.xml'
        gender_model_path = self.checkpoint_dir+'/gender_models/simple_CNN.81-0.96.hdf5'
        gender_labels = {0:'woman', 1:'man'}
        font = cv2.FONT_HERSHEY_SIMPLEX

        # hyper-parameters for bounding boxes shape
        gender_offsets = (30, 60)
        gender_offsets = (10, 10)


        # loading models
        face_detection = load_detection_model(detection_model_path)
        gender_classifier = load_model(gender_model_path, compile=False)

        # getting input model shapes for inference
        gender_target_size = gender_classifier.input_shape[1:3]

        # loading images
        gray_image = np.squeeze(gray_image)
        gray_image = gray_image.astype('uint8')

        faces = detect_faces(face_detection, gray_image)
        gender_location_texts= []
        for face_coordinates in faces:
            x1, x2, y1, y2 = apply_offsets(face_coordinates, gender_offsets)
            rgb_face = rgb_image[y1:y2, x1:x2]
            try:
                rgb_face = cv2.resize(rgb_face, (gender_target_size))
            except:
                continue
            rgb_face = preprocess_input(rgb_face, False)
            rgb_face = np.expand_dims(rgb_face, 0)
            gender_prediction = gender_classifier.predict(rgb_face)
            gender_label_arg = np.argmax(gender_prediction)
            gender_text = gender_labels[gender_label_arg]
            gender_location_texts.append({'gender':gender_text,'location':face_coordinates})
        return gender_location_texts