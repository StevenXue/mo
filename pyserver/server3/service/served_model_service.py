# -*- coding: UTF-8 -*-
import subprocess

from server3.business import user_business
from server3.business import ownership_business
from server3.business import served_model_business
from server3.business import staging_data_set_business
from server3.business import job_business
from server3.service import ownership_service
from server3.service import model_service
from server3.entity.model import MODEL_TYPE

ModelType = {list(v)[1]: list(v)[0] for v in list(MODEL_TYPE)}


def add(user_ID, name, description, version, pid, server, signatures,
        input_type,
        model_base_path, is_private=False):
    """
    add a served model
    :param user_ID:
    :param is_private:
    :param name:
    :param description:
    :param server:
    :param signatures:
    :param input_type:
    :param model_base_path:
    :return:
    """
    served_model = served_model_business.add(name, description, version, pid,
                                             server,
                                             signatures, input_type,
                                             model_base_path)
    user = user_business.get_by_user_ID(user_ID)
    ownership_business.add(user, is_private, served_model=served_model)
    return served_model


def list_served_models_by_user_ID(user_ID, order=-1):
    if not user_ID:
        raise ValueError('no user id')
    public_sm = ownership_service.get_all_public_objects('served_model')
    owned_sm = ownership_service. \
        get_private_ownership_objects_by_user_ID(user_ID, 'served_model')
    # set status
    public_sm = [set_status(sm) for sm in public_sm]
    owned_sm = [set_status(sm) for sm in owned_sm]
    if order == -1:
        public_sm.reverse()
        owned_sm.reverse()
    return public_sm, owned_sm


def set_status(served_model):
    served_model.status = served_model_business.get_process(
        served_model.pid).status()
    return served_model


def deploy(user_ID, job_id, name, description, server, signatures,
           input_type, is_private=False):
    """
    deploy model by create a tensorflow servable subprocess
    :param user_ID: str
    :param job_id: str/ObjectId
    :param name: str
    :param description: str
    :param server: str
    :param signatures: dict
    :param input_type: str
    :param is_private: bool
    :return:
    """
    job = job_business.get_by_job_id(job_id)
    model_type = job.model.category
    if model_type == ModelType['neural_network'] or model_type == ModelType['folder_input']:
        export_path, version = model_service.export(name, job_id, user_ID)
    else:
        result_sds = staging_data_set_business.get_by_job_id(job_id)
        saved_model_path_array = result_sds.saved_model_path.split('/')
        version = saved_model_path_array.pop()
        export_path = '/'.join(saved_model_path_array)
    tf_model_server = './tensorflow_serving/model_servers/tensorflow_model_server'
    p = subprocess.Popen([
        tf_model_server,
        '--enable_batching',
        '--port=9000',
        '--model_name={name}'.format(name=name),
        '--model_base_path={export_path}'.format(export_path=export_path)
    ])
    # add a served model entity
    return add(user_ID, name, description,
               version, p.pid, server,
               signatures, input_type, export_path,
               is_private)


def remove_by_id(model_id):
    served_model_business.terminate_by_id(model_id)
    served_model_business.remove_by_id(model_id)



