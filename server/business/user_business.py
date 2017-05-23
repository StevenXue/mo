from entity.user import User
from repository.user_repo import UserRepo

user_repo = UserRepo(User)


def get_by_user_ID(user_ID):
    user_obj = User(user_ID=user_ID)
    return user_repo.read_by_user_ID(user_obj)
