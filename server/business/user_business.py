from server.entity.user import User
from server.repository.user_repo import UserRepo

user_repo = UserRepo(User)


def find_by_user_id(user_id):
    return user_repo.find_unique_one({'user_id': user_id})
