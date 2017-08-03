import keras
from keras.datasets import mnist
from keras import backend as K


def get_mnist_data():
    # the data, shuffled and split between train and test sets
    (x_train, y_train), (x_test, y_test) = mnist.load_data()
    img_rows, img_cols = 28, 28
    if K.image_data_format() == 'channels_first':
        x_train = x_train.reshape(x_train.shape[0], 1, img_rows, img_cols)
        x_test = x_test.reshape(x_test.shape[0], 1, img_rows, img_cols)
        input_shape = (1, img_rows, img_cols)
    else:
        x_train = x_train.reshape(x_train.shape[0], img_rows, img_cols, 1)
        x_test = x_test.reshape(x_test.shape[0], img_rows, img_cols, 1)
        input_shape = (img_rows, img_cols, 1)

    x_train = x_train.astype('float32')
    x_test = x_test.astype('float32')
    x_train /= 255
    x_test /= 255
    print('x_train shape:', x_train.shape)
    # convert class vectors to binary class matrices
    num_classes = 10
    y_train = keras.utils.to_categorical(y_train, num_classes)
    y_test = keras.utils.to_categorical(y_test, num_classes)
    print('y_train shape:', y_train.shape)
    print(x_train.shape[0], 'train samples')
    print(x_test.shape[0], 'test samples')

    return x_train, y_train, x_test, y_test


if __name__ == '__main__':
    import mnist_mlp
    import mnist_cnn
    import mnist_irnn
    import mnist_hierarchical_rnn
    x_train, y_train, x_test, y_test = get_mnist_data()
    input = {
        'x_tr': x_train,
        'y_tr': y_train,
        'x_te': x_test,
        'y_te': y_test,
    }
    conf = {
        'fit': {
            "args": {
                "batch_size": 32,
                "epochs": 5,
            },
        },
        'evaluate': {
            'args': {
                'verbose': 1
            }
        }
    }
    # result = mnist_mlp.mnist_mlp(conf=conf, input=input)
    # result = mnist_cnn.mnist_cnn(conf=conf, input=input)
    # result = mnist_irnn.mnist_irnn(conf=conf, input=input)
    result = mnist_hierarchical_rnn.mnist_hierarchical_rnn(conf=conf, input=input)
    print(result['score'])
