
from datetime import datetime

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

def create_user():
    obj = {
        'user_id': 'test_user',
        'name': 'zhaofeng',
        'password': '123456',
        'phone': 15250428487,
        'gender': 'male',
        'age': 23
    }
    user_obj = User(**obj)
    user_obj.save()


def find_user_by_id(user_id):
    User.find_by_user_id()

