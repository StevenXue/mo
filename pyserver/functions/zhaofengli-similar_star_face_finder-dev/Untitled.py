# coding: utf-8
import os
import sys
import re
import base64
import json
from io import BytesIO
from function.modules import json_parser
from function.modules import Client
from keras.preprocessing import image
from PIL import Image
import numpy as np



client = Client('fackAPI', silent=True)
run = client.run
train = client.train
predict = client.predict
work_path = ''
default_path =work_path
# default_path =''

def handle(conf):
    def base64_to_image(base64_str, grayscale, target_size):
        base64_data = re.sub('^data:image/.+;base64,', '', base64_str)
        byte_data = base64.b64decode(base64_data)
        image_data = BytesIO(byte_data)
        img = image.load_img(image_data, grayscale, target_size)
        return image.img_to_array(img)

    def image_to_base64(img):
        buffered = BytesIO()
        img.save(buffered, format="JPEG")
        img_str = base64.b64encode(buffered.getvalue())
        return img_str.decode("utf-8")

    def face_distance(face_encodings, face_to_compare):
    # computing face feature distance between two images
        if len(face_encodings) == 0:
            return np.empty((0))
        return np.linalg.norm(face_encodings - face_to_compare, axis=1)
    input_img = conf['img']
    rgb_image = base64_to_image(input_img,False,target_size=(224, 224))
    gray_image = base64_to_image(input_img,True,target_size=(224, 224))
    gender_classifier_conf = {'rgb_image':rgb_image,'gray_image':gray_image}
    result = run('zhaofengli/new_gender_classifier/0.0.2', gender_classifier_conf)

    if len(result)>0:
        gender = result[0]['gender']
    else:
        gender = 'man'
    if gender == 'man':
        girl_path_list = os.listdir(default_path+"girl")
        girl_path_list = [default_path+"girl/"+p for p in girl_path_list]
        img_list = [image.img_to_array(image.load_img(p, target_size=(224, 224))) for p in girl_path_list]
    else:
        boy_path_list = os.listdir(default_path+"boy")
        boy_path_list = [default_path+"boy/"+p for p in boy_path_list]
        img_list = [image.img_to_array(image.load_img(p, target_size=(224, 224))) for p in boy_path_list]
    img_list.append(rgb_image)
    feed ={'imgs':img_list,'model_path':default_path+'mymodel.h5','weight_path':default_path+'myweight.hdf5'}
    res = predict('zhaofengli/new_face_feature/0.0.2',feed)
    res = [i[0,:] for i in res]
    dis = face_distance(res[0:-1],res[-1])
    index = dis.argmin()
    base64_str = image_to_base64(image.array_to_img(img_list[index]))
    return json.dumps({"fql": base64_str})
