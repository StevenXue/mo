from tornado import gen
from jupyterhub.auth import Authenticator


class SuperSecureAuthenticator(Authenticator):
    @gen.coroutine
    def authenticate(self, handler, data):
        username = data['username']
        # check password:
        if data['username'] == data['password']:
            return username