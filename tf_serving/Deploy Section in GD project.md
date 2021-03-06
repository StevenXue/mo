# Deploy Section in GD projectDetail

### gRPC Connection Info:
Deployed: 
    $> tensorflow_model_server --port:9000 --model_name=inception --model_base_path=/tmp/inception_output/

IP: X.X.X.X
Port: 9000

```
from grpc.beta import implementations
import tensorflow as tf

from tensorflow_serving.apis import predict_pb2
from tensorflow_serving.apis import prediction_service_pb2

tf.app.flags.DEFINE_string('server', 'localhost:9000', 'PredictionService host:port')
tf.app.flags.DEFINE_string('image', '', 'path to image in JPEG format')

FLAGS = tf.app.flags.FLAGS

def main(_):
	host, port = FLAGS.server.split(':')
	channel = implementations.insecure_channel(host, int(port))
	stub = prediction_service_pb2.beta_create_PredictionService_stub(channel)

	# Send request
	with open(FLAGS.image, 'rb') as f:
	
        # See prediction_service.proto for gRPC request/response details.
        data = f.read()
        request = predict_pb2.PredictRequest()
        request.model_spec.name = 'inception'
        request.model_spec.signature_name = 'predict_images'
        request.inputs['images'].CopyFrom(tf.contrib.util.make_tensor_proto(data, shape=[1]))
        result = stub.Predict(request, 10.0)  # 10 secs timeout
        print(result)

if __name__ == '__main__':
  tf.app.run()
```



### Prediction Data Upload



### Model Definition

#### Model Composition



#### Model Signature
...
predict_inputs_tensor_info = tf.saved_model.utils.build_tensor_info(jpegs)
prediction_signature = (
    tf.saved_model.signature_def_utils.build_signature_def(
        inputs={'images': predict_inputs_tensor_info},
        outputs={
            'classes': classes_output_tensor_info,
            'scores': scores_output_tensor_info
        },
        method_name=tf.saved_model.signature_constants.PREDICT_METHOD_NAME
  ))
...
builder.add_meta_graph_and_variables(
    sess, [tf.saved_model.tag_constants.SERVING],
    signature_def_map={
        'predict_images':
          prediction_signature,
        tf.saved_model.signature_constants.
        DEFAULT_SERVING_SIGNATURE_DEF_KEY:
          classification_signature,
    },
    legacy_init_op=legacy_init_op)

