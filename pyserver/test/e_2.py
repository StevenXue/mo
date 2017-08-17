import tensorflow as tf
import numpy as np


# # create data
# x_data = np.random.rand(100).astype(np.float32)
# y_data = x_data*0.1 + 0.3
#
# Weights = tf.Variable(tf.random_uniform([1], -1.0, 1.0))
# biases = tf.Variable(tf.zeros([1]))
#
# y = Weights*x_data + biases
#
# loss = tf.reduce_mean(tf.square(y-y_data))
# optimizer = tf.train.GradientDescentOptimizer(0.5)
# train = optimizer.minimize(loss)
#
# # init = tf.se
#
# matrix1 = tf.constant([[3, 3]])
#
# matrix2 = tf.constant([[2],[2]])
#
# product = tf.matmul(matrix1, matrix2)
#
# # method 1
# sess = tf.Session()
# result = sess.run(product)
# print(result)
# sess.close()
#
# # method 2
# with tf.Session() as sess:
#     result2 = sess.run(product)
#     print(result)


def example_1():
    state = tf.Variable(0, name='counter')
    print(state.name)
    one = tf.constant(1)
    new_value = tf.add(state, one)
    update = tf.assign(state, new_value)

    init = tf.initialize_all_variables()
    with tf.Session() as sess:
        sess.run(init)
        for _ in range(3):
            sess.run(update)
            print(sess.run(state))


def example_placeholder():
    input1 = tf.placeholder(tf.float32)
    input2 = tf.placeholder(tf.float32)
    output = tf.multiply(input1, input2)

    with tf.Session() as sess:
        print(sess.run(output, feed_dict={input1: [7.], input2: [2.]}))


def example_add_layer():
    def add_layer(inputs, in_size, out_size, activation_function=None):
        Weights = tf.Variable(tf.random_normal([in_size, out_size]))
        biases = tf.Variable(tf.zeros([1, out_size]) + 0.1)
        Wx_plus_b = tf.matmul(inputs, Weights) + biases
        if activation_function is None:
            outputs = Wx_plus_b
        else:
            outputs = activation_function(Wx_plus_b)
        return outputs

    x_data = np.linspace(-1, 1, 300)[:, np.newaxis]
    noise = np.random.normal((0, 0.05, x_data.shape))
    y_data = np.square(x_data) - 0.5 + noise

    l1 = add_layer(x_data, 1, 10, activation_function=tf.nn.relu)
    prediction = add_layer(l1 )


from grpc.beta import implementations
import tensorflow as tf

from tensorflow_serving.apis import predict_pb2
from tensorflow_serving.apis import prediction_service_pb2

tf.app.flags.DEFINE_string('server', 'localhost:9000',
                           'PredictionService host:port')
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
    request.inputs['images'].CopyFrom(
        tf.contrib.util.make_tensor_proto(data, shape=[1]))
    result = stub.Predict(request, 10.0)  # 10 secs timeout
    print(result)


if __name__ == '__main__':
    tf.app.run()


if __name__ == '__main__':
    example_placeholder()
