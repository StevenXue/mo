# -*- coding: UTF-8 -*-
import os
import psutil
import subprocess

from mongoengine import DoesNotExist
# from kubernetes import client
# from kubernetes import config as kube_config
import port_for

from server3.business import user_business
from server3.business import ownership_business
from server3.business import served_model_business
from server3.business import staging_data_set_business
from server3.business import job_business
from server3.service import ownership_service
from server3.service import model_service
from server3.service import kube_service
from server3.utility import network_utility
from server3.entity.model import MODEL_TYPE
from server3.constants import SERVING_PORT
from server3.constants import NAMESPACE

ModelType = {list(v)[1]: list(v)[0] for v in list(MODEL_TYPE)}


def update_db(user_ID, name, description, input_info, output_info,
              examples):
    """

    :param user_ID:
    :param name:
    :param description:
    :param input_info:
    :param output_info:
    :param examples:
    :return:
    """
    served_model_business.update_info(name, description, input_info,
                                      output_info, examples)


def first_save_to_db(user_ID, name, description, input_info, output_info,
                     examples, version,
                     deploy_name, server,
                     input_type, model_base_path, job, is_private=False,
                     **optional):
    """
    add a served model
    :param user_ID:
    :param is_private:
    :param name:
    :param description:
    :param input_info: str
    :param output_info: str
    :param examples: str
    :param server:
    :param input_type:
    :param model_base_path:
    :return:
    """
    served_model = served_model_business.add(name, description, input_info,
                                             output_info,
                                             examples, version, deploy_name,
                                             server,  input_type,
                                             model_base_path, job, **optional)
    user = user_business.get_by_user_ID(user_ID)
    ownership_business.add(user, is_private, served_model=served_model)
    return served_model


def list_served_models_by_user_ID(user_ID, order=-1):
    if not user_ID:
        raise ValueError('no user id')
    public_sm = ownership_service.get_all_public_objects('served_model')
    owned_sm = ownership_service. \
        get_privacy_ownership_objects_by_user_ID(user_ID, 'served_model')
    # set status
    public_sm = [kube_service.get_deployment_status(sm) for sm in public_sm]
    owned_sm = [kube_service.get_deployment_status(sm) for sm in owned_sm]
    if order == -1:
        public_sm.reverse()
        owned_sm.reverse()
    return public_sm, owned_sm


def first_deploy(user_ID, job_id, name, description, input_info, output_info,
                 examples, server, input_type, is_private=False,
                 **optional):
    """
    deploy model by create a tensorflow servable subprocess
    :param user_ID: str
    :param job_id: str/ObjectId
    :param name: str
    :param description: str
    :param input_info: str
    :param output_info: str
    :param examples: str
    :param server: str
    :param input_type: str
    :param is_private: bool
    :return:
    """
    job = job_business.get_by_job_id(job_id)

    # if not deployed do the deployment
    try:
        served_model_business.get_by_job(job)
    except DoesNotExist:
        model_type = job.model.category
        if model_type == ModelType['neural_network'] \
                or model_type == ModelType['unstructured']:
            export_path, version = model_service.export(name, job_id, user_ID)
        else:
            result_sds = staging_data_set_business.get_by_job_id(job_id)
            saved_model_path_array = result_sds.saved_model_path.split('/')
            version = saved_model_path_array.pop()
            export_path = '/'.join(saved_model_path_array)

        cwd = os.getcwd()
        deploy_name = job_id + '-serving'
        port = port_for.select_random(ports=set(range(30000, 32767)))
        export_path = export_path.replace('./user_directory',
                                          '/home/root/work/user_directory')
        kube_json = {
            "apiVersion": "apps/v1beta1",
            "kind": "Deployment",
            "metadata": {
                "name": deploy_name
            },
            "spec": {
                "template": {
                    "metadata": {
                        "labels": {
                            "app": job_id
                        }
                    },
                    "spec": {
                        # "securityContext": {
                        #     "runAsUser": 1001,
                        # },
                        "containers": [
                            {
                                "name": job_id,
                                "image": "10.52.14.192/gzyw/serving_app",
                                "imagePullPolicy": "IfNotPresent",
                                "ports": [{
                                    "containerPort": 9000,
                                    # "hostPort": port
                                }],
                                "stdin": True,
                                "command": ['tensorflow_model_server'],
                                "args": ['--enable_batching',
                                         '--port={port}'.format(
                                             port=SERVING_PORT),
                                         '--model_name={name}'.format(
                                             name=name),
                                         '--model_base_path={export_path}'.format(
                                             export_path=export_path)],
                                "volumeMounts": [
                                    {
                                        "mountPath": "/home/root/work/user_directory",
                                        "name": "nfsvol"
                                    },
                                    # {
                                    #     "mountPath": "/home/root/work/user_directory",
                                    #     "name": job_id + "-volume"
                                    # }
                                ]
                            }
                        ],
                        "volumes": [
                            {
                                "name": "nfsvol",
                                "persistentVolumeClaim": {
                                    "claimName": "nfs-pvc"
                                }
                            },
                            # {
                            #     "name": job_id + "-volume",
                            #     "hostPath": {
                            #         "path": "{}/user_directory".format(cwd)},
                            # }
                        ]
                    },
                },
            }
        }
        service_json = {
            "kind": "Service",
            "apiVersion": "v1",
            "metadata": {
                "name": "my-" + job_id + "-service"
            },
            "spec": {
                "type": "NodePort",
                "ports": [
                    {
                        "port": 9000,
                        "nodePort": port
                    }
                ],
                "selector": {
                    "app": job_id
                }
            }
        }
        # import json
        # from server3.utility import file_utils
        # file_utils.write_to_filepath(json.dumps(kube_json), './jupyter_app.json')
        # return
        api = kube_service.deployment_api
        s_api = kube_service.service_api
        resp = api.create_namespaced_deployment(body=kube_json,
                                                namespace=NAMESPACE)
        s_api.create_namespaced_service(body=service_json, namespace=NAMESPACE)
        # tf_model_server = './tensorflow_serving/model_servers/tensorflow_model_server'
        # p = subprocess.Popen([
        #     tf_model_server,
        #     '--enable_batching',
        #     '--port={port}'.format(port=SERVING_PORT),
        #     '--model_name={name}'.format(name=name),
        #     '--model_base_path={export_path}'.format(export_path=export_path)
        # ], start_new_session=True)
        # add a served model entity
        server = server.replace('9000', str(port))
        return first_save_to_db(user_ID, name, description, input_info,
                                output_info,
                                examples, version,
                                deploy_name, server,
                                input_type, export_path, job,
                                is_private,
                                **optional)


def remove_by_id(served_model_id):
    served_model = served_model_business.get_by_id(served_model_id)
    kube_service.delete_deployment(served_model.name)
    # served_model_business.terminate_by_id(served_model_id)
    served_model_business.remove_by_id(served_model_id)
