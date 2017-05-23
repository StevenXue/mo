import os

from server.business import file_business
from server.business import user_business


def add_file(file_name, file_size, url, user_id):
    if not user_id:
        raise ValueError('no user id input')
    user = user_business.get_by_user_id(user_id)
    if not user:
        raise NameError('no user found')
    file_business.add(file_name, file_size, url, user)


def save_file_and_get_size(file):
    # partial import to avoid circular import
    from server.run import app as flask_app
    file.save(os.path.join(flask_app.config['UPLOAD_FOLDER'], file.filename))
    return os.stat(os.path.join(flask_app.config['UPLOAD_FOLDER'])).st_size
