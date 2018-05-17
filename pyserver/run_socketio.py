# -*- coding: UTF-8 -*-
import eventlet
eventlet.monkey_patch()

from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO

from server3.repository import config
from server3.constants import SOCKET_IO_PORT
from server3.constants import REDIS_SERVER

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')

app = Flask(__name__)
app.secret_key = 'super-super-secret'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

socketio = SocketIO(app, logger=True, engineio_logger=True, ping_timeout=600,
                    async_mode='eventlet', message_queue=REDIS_SERVER)

CORS(app, supports_credentials=True)

if __name__ == '__main__':
    socketio.run(app, host='0.0.0.0', port=SOCKET_IO_PORT, debug=True)
