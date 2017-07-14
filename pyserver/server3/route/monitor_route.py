# -*- coding: UTF-8 -*-
"""
Blueprint for file

Author: Zhaofeng Li
Date: 2017.06.25
"""
import json
from urllib.parse import unquote
import time
from bson import ObjectId
from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import request
from flask import send_from_directory


PREFIX = '/monitor'

monitor_app = Blueprint("monitor_app", __name__, url_prefix=PREFIX)

subscriptions = []


@monitor_app.route('/events', methods=['POST'])
def upload_events():
    # payload = request.form.get('data')
    # payload = unquote(request.data.split('=')[1]).replace('+','')
    payload = unquote(request.data.decode("utf-8").split('=')[1]).replace('+',
                                                                          '')
    try:
        data = json.loads(payload)
        print('data', data)
    except:
        return {'error': 'invalid payload'}

    # def notify():
    #     msg = str(time.time())
    #     for sub in subscriptions[:]:
    #         sub.put(payload)
    #
    # gevent.spawn(notify)
    return "OK"

