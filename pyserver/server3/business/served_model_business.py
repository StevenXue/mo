# -*- coding: UTF-8 -*-
"""
# @author   : Zhaofeng Li
# @version  : 1.0
# @date     : 2017-08-22
# @running  : python
"""

# import pandas as pd
# import numpy as np
# from sklearn.cluster import KMeans
# from minepy import MINE
import psutil

from server3.entity.served_model import ServedModel
from server3.repository.served_model_repo import ServedModelRepo
from server3.constants import NAMESPACE
from server3.service import kube_service

served_model_repo = ServedModelRepo(ServedModel)
api = kube_service.deployment_api
options = kube_service.options


def get_by_privacy(privacy):
    return served_model_repo.read(query={'private': privacy})


def get_by_category(category):
    return served_model_repo.read(query={'category': category})


def get_by_id(model_obj):
    return served_model_repo.read_by_id(model_obj)


def get_by_job(job):
    return served_model_repo.read_by_unique_field('job', job)


def add(name, description, input_info, output_info, examples, version,
        deploy_name, server,
        input_type,
        model_base_path, job, service_name, model_name,
        related_fields,
        related_tasks,
        tags, is_private, data_fields,
        input_data_demo_string, create_time, user, **optional):
    print('data_fields')
    print(data_fields)

    print('input_data_demo_string')
    print(input_data_demo_string)

    model = ServedModel(name=name, description=description,
                        input_info=input_info,
                        output_info=output_info,
                        examples=examples,
                        version=version, deploy_name=deploy_name,
                        server=server,
                        input_type=input_type,
                        model_base_path=model_base_path, job=job,
                        service_name=service_name,
                        model_name=model_name,
                        related_fields=related_fields,
                        related_tasks=related_tasks,
                        tags=tags, private=is_private,
                        data_fields=data_fields,
                        input_data_demo_string=input_data_demo_string,
                        create_time=create_time,
                        user=user,
                        **optional)

    return served_model_repo.create(model)


def update_info(served_model_id, update):
    served_model_repo.update_one_by_id(served_model_id, update)


def remove_by_id(model_id):
    return served_model_repo.delete_by_id(model_id)


# def get_process_by_id(oid):
#     served_model = get_by_id(oid)
#     return psutil.Process(served_model.pid)
#
#
# def get_process(pid):
#     return psutil.Process(pid)
#
#
# def get_status(oid):
#     served_model = get_by_id(oid)
#     api.read_namespaced_deployment_status(served_model.deploy_name, NAMESPACE)


def check_condition(deploy_name, status):
    """
    check running condition of served model
    :param deploy_name: deploy name in the served model entity
    :param status: the status to check, choose from 'Progressing' and 'Available'
    :return:
    """
    deploy = api.read_namespaced_deployment(deploy_name, NAMESPACE)
    if deploy:
        return [c.status for c in deploy.status.conditions if c.type ==
                status][0] == 'True'
    else:
        return 'False'


def terminate_by_id(oid):
    served_model = get_by_id(oid)
    api.delete_namespaced_deployment(served_model.deploy_name,
                                     NAMESPACE, options)


def get_by_four_querys(related_fields=None, related_tasks=None, tags=None,
                       privacy=None, skipping=None, search_str=None):
    return served_model_repo.query_four(related_fields=related_fields,
                                        related_tasks=related_tasks,
                                        tags=tags, skipping=skipping,
                                        privacy=privacy,
                                        search_str=search_str)


# def suspend_by_id(oid):
#     p = get_process_by_id(oid)
#     p.suspend()
#     if p.status() == 'stopped':
#         return True
#
#
# def resume_by_id(oid):
#     p = get_process_by_id(oid)
#     p.resume()
#     if p.status() == 'running':
#         return True


if __name__ == '__main__':
    pass
