"""
Blueprint for logs

Author: Zhaofeng Li
Date: 2017.05.22
"""

from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import redirect
from flask import request
from flask import send_from_directory

from service import ownership_service
from utility import json_utility

PREFIX = '/ownership'


ownership_app = Blueprint("ownership_app", __name__, url_prefix=PREFIX)


@ownership_app.route('/list_ownership_by_user_ID', methods=['GET'])
def list_ownership_by_user_ID():
    user_ID = request.args.get('user_ID')
    try:
        ownerships = ownership_service.list_by_user_ID(user_ID)
        ownerships = [ownership.to_mongo() for ownership in ownerships]
        ownerships = json_utility.convert_to_json(ownerships)
        # ownerships = ownerships.to_json()
    except Exception, e:
        return make_response(jsonify({'response': '%s: %s' % (str(
            Exception), e.args)}, 400))
    return make_response(jsonify({'response': ownerships}), 200)

