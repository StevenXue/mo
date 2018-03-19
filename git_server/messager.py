# -*- coding: UTF-8 -*-
from datetime import datetime
import requests
# from flask_socketio import SocketIO
# from constants import REDIS_SERVER

# socketio = SocketIO(message_queue=REDIS_SERVER)


def emit_on_commit():
    with open('./temp.log', 'w') as f:
        f.write(datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    # socketio.emit('world', 'sss', namespace='/log')
    # requests.post('')


emit_on_commit()
