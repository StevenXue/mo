
from kubernetes import client
from kubernetes import config as kube_config
from kubernetes.client.models import v1_delete_options

try:
    kube_config.load_kube_config()

except:
    pass

deployment_api = client.AppsV1beta1Api()
job_api = client.BatchV1Api()
options = v1_delete_options.V1DeleteOptions()


from server3.constants import NAMESPACE


def get_deployment_status(served_model):
    if check_deployment_condition(served_model.deploy_name,
                                  'Progressing'):
        served_model.status = 'running'
    else:
        served_model.status = 'terminated'
    return served_model


def get_job_status(job_info, job_name):
    if check_job_condition(job_name, 'Complete'):
        job_info['kube_status'] = 'Completed'
    elif check_job_condition(job_name, 'Progressing'):
        job_info['kube_status'] = 'Running'
    else:
        job_info['kube_status'] = 'Terminated'
    return job_info


def check_deployment_condition(deploy_name, status):
    """
    check running condition of served model
    :param deploy_name: deploy name in the served model entity
    :param status: the status to check, choose from 'Progressing' and 'Available'
    :return:
    """
    try:
        deploy = deployment_api.read_namespaced_deployment(deploy_name,
                                                           NAMESPACE)
    except client.rest.ApiException:
        return False
    else:
        return check_condition(deploy, status)


def check_job_condition(job_name, status):
    """
    check running condition of served model
    :param job_name: job name
    :param status: the status to check, choose from 'Progressing' and 'Available'
    :return:
    """
    try:
        job = job_api.read_namespaced_job(job_name, NAMESPACE)
    except client.rest.ApiException:
        return False
    else:
        return check_condition(job, status)


def check_condition(kube, status):
    if kube and kube.status.conditions and \
       kube.status.conditions[0].type == status and \
       kube.status.conditions[0].status:
        return True
    else:
        return False


def delete_deployment(deploy_name):
    return deployment_api.delete_namespaced_deployment(deploy_name, NAMESPACE,
                                                       options)


def delete_job(job_name):
    return job_api.delete_namespaced_job(job_name, NAMESPACE, options)
