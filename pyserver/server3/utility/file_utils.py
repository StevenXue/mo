import os


def write_to_filepath(tmp_str, path='./temp_model111.py', create_dir=True):
    """ write python string to temp file

    :param tmp_str:
    :param path:
    :return:
    """
    if create_dir:
        # create dir if not exists
        directory = os.path.dirname(path)
        if not os.path.exists(directory):
            os.makedirs(directory)
    with open(path, 'w') as f:
        f.write(tmp_str)
        f.close()