import os
import sys

# TODO import form lib __init__.py
import keras.backend as K
import tensorflow as tf
from keras.applications import VGG19
from keras.models import Model
from keras.models import load_model
from keras.models import model_from_json
from tensorflow.python.saved_model import builder as saved_model_builder
from tensorflow.python.saved_model import tag_constants
from tensorflow.python.saved_model.signature_def_utils_impl import \
    predict_signature_def
from tensorflow.python.lib.io import file_io

load_model = load_model
model_from_json = model_from_json

# very important to do this as a first thing
K.set_learning_phase(0)


def create_model_vgg19():
    # Creating the model
    model = VGG19(include_top=True, weights='imagenet')

    # The creation of a new model might be optional depending on the goal
    config = model.get_config()
    weights = model.get_weights()
    new_model = Model.from_config(config)
    new_model.set_weights(weights)


def export(new_model, working_dir, export_path_base):
    # Exporting the model
    tf.app.flags.DEFINE_integer('model_version', 1,
                                'version number of the model.')
    tf.app.flags.DEFINE_string('work_dir', working_dir, 'Working directory.')
    FLAGS = tf.app.flags.FLAGS

    export_path = os.path.join(
        tf.compat.as_bytes(export_path_base),
        tf.compat.as_bytes(str(FLAGS.model_version)))

    # if version path exists, create a new version
    if file_io.file_exists(export_path):
        export_path = os.path.join(
            tf.compat.as_bytes(export_path_base),
            tf.compat.as_bytes(str(FLAGS.model_version + 1)))

    builder = saved_model_builder.SavedModelBuilder(export_path)

    signature = predict_signature_def(inputs={'inputs': new_model.input},
                                      outputs={'scores': new_model.output})

    with K.get_session() as sess:
        builder.add_meta_graph_and_variables(sess=sess,
                                             tags=[tag_constants.SERVING],
                                             signature_def_map={
                                                 'predict': signature})
        builder.save()
