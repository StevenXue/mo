import jwt
from tornado import gen
from jupyterhub.auth import Authenticator

SECRET = 'super-super-secret'
ALGORITHM = 'HS256'
IDENTITY = 'identity'


class SuperSecureAuthenticator(Authenticator):
    @gen.coroutine
    def authenticate(self, handler, data):
        tmp_username = data['username']
        # decode token:
        token_data = jwt.decode(data['password'], SECRET, algorithms=[
            ALGORITHM])
        if token_data[IDENTITY] == tmp_username.split('/')[0]:
            return tmp_username
