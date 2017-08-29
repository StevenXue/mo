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

served_model_repo = ServedModelRepo(ServedModel)


def get_by_id(model_obj):
    return served_model_repo.read_by_id(model_obj)


def get_by_job(job):
    return served_model_repo.read_by_unique_field('job', job)


def add(name, description, version, pid, server, signatures, input_type,
        model_base_path, job, **optional):
    model = ServedModel(name=name, description=description,
                        version=version, pid=pid, server=server,
                        signatures=signatures, input_type=input_type,
                        model_base_path=model_base_path, job=job, **optional)
    return served_model_repo.create(model)


def remove_by_id(model_id):
    return served_model_repo.delete_by_id(model_id)


def get_process_by_id(oid):
    served_model = get_by_id(oid)
    return psutil.Process(served_model.pid)


def get_process(pid):
    return psutil.Process(pid)


def terminate_by_id(oid):
    try:
        p = get_process_by_id(oid)
        p.terminate()
        return True
    except psutil.NoSuchProcess:
        return True


def suspend_by_id(oid):
    p = get_process_by_id(oid)
    p.suspend()
    if p.status() == 'stopped':
        return True


def resume_by_id(oid):
    p = get_process_by_id(oid)
    p.resume()
    if p.status() == 'running':
        return True

if __name__ == '__main__':
    pass
