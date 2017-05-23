from server.entity.user import User
from server.repository.user_repo import UserRepo

user_repo = UserRepo(User)


def get_by_user_id(user_id):
    user_obj = User(user_id=user_id)
    return user_repo.read_by_id(user_obj)
