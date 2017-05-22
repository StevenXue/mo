
from datetime import datetime

from server.entity.file import File
from server.entity.user import User


# def create_file(file_name, file_size, url, user_id):
#     user = User.find_by_user_id(User, user_id)
#     obj = {
#         'name': file_name,
#         'upload_time': datetime.utcnow(),
#         'size': file_size,
#         'path': url,
#         'user': user
#     }
#     file_repo.create(obj)
