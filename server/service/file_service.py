import os

from business import file_business
from business import user_business
from business import ownership_business


def add_file(file_name, file_size, url, user_ID, if_private=True):
    if not user_ID:
        raise ValueError('no user id or private input')
    user = user_business.get_by_user_ID(user_ID)
    if not user:
        raise NameError('no user found')
    # try:
    saved_file = file_business.add(file_name, file_size, url)
    # except Exception:
    #     raise Exception('file create failed')
    if saved_file:
        if not ownership_business.add(user, bool(if_private), file=saved_file):
            # revert file saving
            file_business.delete_by_object_id(saved_file['_id'])
            raise RuntimeError('ownership create failed')
    else:
        raise RuntimeError('file create failed')


def save_file_and_get_size(file):
    # partial import to avoid circular import
    from run import app as flask_app
    file.save(os.path.join(flask_app.config['UPLOAD_FOLDER'], file.filename))
    return os.stat(os.path.join(flask_app.config['UPLOAD_FOLDER'])).st_size
