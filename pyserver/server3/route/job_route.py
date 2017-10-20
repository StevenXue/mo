# -*- coding: UTF-8 -*-
"""
Blueprint for job

Author: Bingwei Chen
Date: 2017.10.20

"""

from flask import Blueprint
from flask import jsonify
from flask import make_response
from flask import request

from server3.business import job_business
from server3.business import project_business
from server3.business import toolkit_business


PREFIX = '/job'

model_app = Blueprint("model_app", __name__, url_prefix=PREFIX)

eg = {
    'project_id': 'objectid',
    'job_type': 'toolkit',
    'algorithm': {
        'name': 'k-mean',
        '_id': 'objectid',
    }
}


@model_app.route('/job', methods=['POST'])
def create_job():
    """用于生成用户工作单位section


    :return:
    :rtype:
    """
    data = request.get_json()

    #

    if data['job_type'] == 'toolkit':
        toolkit_id = data['algorithm']['_id']
        project_id = data['project_id']

        toolkit_obj = toolkit_business.get_by_toolkit_id(toolkit_id)
        staging_data_set_obj = None
        project_obj = project_business.get_by_id(project_id)

        # toolkit obj to conf (need be move to?)


        job_obj = job_business.add_toolkit_job(
            toolkit_obj,
            staging_data_set_obj,
            project_obj,

        )

        pass
    else:
        pass



    pass
