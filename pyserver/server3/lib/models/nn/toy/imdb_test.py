import keras
from keras.datasets import imdb


def get_imdb_data(max_features=20000):
    # the data, shuffled and split between train and test sets
    print('Loading data...')
    (x_train, y_train), (x_test, y_test) = imdb.load_data(
        path="imdb.npz",
        num_words=max_features)
    print(len(x_train), 'train sequences')
    print(len(x_test), 'test sequences')
    print(x_train[0])
    print(y_train[0])
    return x_train, y_train, x_test, y_test


if __name__ == '__main__':
    # import text_lstm_classifier
    # import text_cnn_lstm_classifier
    # import text_cnn_classifier
    import text_fasttext_classifier

    x_train, y_train, x_test, y_test = get_imdb_data()
    input = {
        'x_tr': x_train,
        'y_tr': y_train,
        'x_te': x_test,
        'y_te': y_test,
        'max_features': 20000,
        'maxlen': 80,
        'ngram_range': 1,
    }
    conf = {
        'fit': {
            "args": {
                "batch_size": 32,
                "epochs": 2,
            },
        },
        'evaluate': {
            'args': {
                "batch_size": 32,
                'verbose': 1
            }
        }
    }
    # result = text_lstm_classifier.text_lstm_classifier(conf=conf,
    # input=input)
    # result = text_cnn_lstm_classifier.text_cnn_lstm_classifier(conf=conf,
    #                                                      input=input)
    # result = text_cnn_classifier.text_cnn_classifier(conf=conf,
    #                                                      input=input)
    result = text_fasttext_classifier.text_fasttext_classifier(conf=conf,
                                                               input=input)

    print(result['score'])
