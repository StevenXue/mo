# -*- coding: UTF-8 -*-
from flask_socketio import SocketIO
# from sio import socketio
from server3.business import staging_data_business
from server3.business import staging_data_set_business
from server3.business import job_business
from server3.utility import json_utility
from server3.constants import REDIS_SERVER

socketio = SocketIO(message_queue=REDIS_SERVER)

epoch = 0


def log_epoch_begin(*args, **kw):
    global epoch
    epoch = args[0]


def log_epoch_end(*args, **kw):
    save_log('epoch', *args, **kw)
    emit_log('epoch', *args, **kw)


def log_batch_end(*args, **kw):
    global epoch
    args = list(args)
    args = json_utility.convert_to_json(args)
    batch = 'Epoch: {}, Batch: {}'.format(epoch, args[0])
    project_id = args[-1]
    emit_message({"batch": batch}, project_id, **kw)


def log_train_end(*args, **kw):
    save_result(*args, **kw)
    # emit_result(*args, **kw)


def emit_log(event, n, logs, result_sds, project_id, **kwargs):
    job_id = kwargs.get('job_id')
    user_ID = kwargs.get('user_ID')
    kw = {'n': n, 'event': event, 'project_id': project_id, 'job_id': job_id}
    kw.update(logs)
    socketio.emit('log_epoch_end', kw, namespace='/log/%s' % user_ID)


# def emit_log(event, n, logs, result_sds, project_id):
#     eventlet.spawn_n(emit_log_fn, event, n, logs, result_sds, project_id)


def emit_message(message, project_id, **kw):
    job_id = kw.get('job_id')
    user_ID = kw.get('user_ID')
    message.update({'job_id': job_id, 'project_id': project_id})
    socketio.emit('log_epoch_end', message, namespace='/log/%s' % user_ID)


def emit_error(message, project_id, **kw):
    job_id = kw.get('job_id')
    user_ID = kw.get('user_ID')
    message.update({'job_id': job_id, 'project_id': project_id})
    socketio.emit('error', message, namespace='/log/%s' % user_ID)


def emit_message_url(message, project_id):
    socketio.emit('send_message', message, namespace='/log/%s' % project_id)


# def emit_message(message, project_id):
#     eventlet.spawn_n(emit_message_fn, message, project_id)


def save_log(event, n, logs, result_sds, project_id, **kw):
    socketio.start_background_task(save_log_fn, event, n, logs, result_sds,
                                   project_id)


def save_result(result_sds, **result):
    socketio.start_background_task(save_result_fn, result_sds, **result)


def save_job_status(job, **result):
    socketio.start_background_task(update_job_status_fn, job, **result)


def save_weights_result(result_sds, max_to_keep, key, new_weight):
    socketio.start_background_task(save_weights_result_fn, result_sds,
                                   max_to_keep,
                                   key,
                                   new_weight)


def save_log_fn(event, n, logs, result_sds, project_id):
    if result_sds is None:
        raise ValueError('no result sds id')

    kw = {'n': n, 'event': event}
    kw.update(logs)
    staging_data_business.add(result_sds, kw)


def save_result_fn(result_sds, **result):
    if result_sds is None:
        raise ValueError('no result sds id passed')
    staging_data_set_business.update(result_sds['id'], **result)


def update_job_status_fn(job, **result):
    if job is None:
        raise ValueError('no job id passed')
    job_business.update_job_by_id(job['id'], **result)


def save_weights_result_fn(result_sds, max_to_keep, key, new_weight):
    if result_sds is None:
        raise ValueError('no result sds id passed')
    result_sds.reload()
    weights = getattr(result_sds, key, None)
    obj = {key: weights}
    if not weights:
        obj[key] = [new_weight]
        staging_data_set_business.update(result_sds['id'], **obj)
    else:
        weights.append(new_weight)
        weights = weights[-max_to_keep:]
        obj[key] = weights
        staging_data_set_business.update(result_sds['id'], **obj)


def emit_result(*args, **kw):
    pass
    # job_id = kw.get('job_id')
    # user_ID = kw.get('user_ID')
    # message.update({'job_id': job_id, 'project_id': project_id})
    # socketio.emit('log_epoch_end', message, namespace='/log/%s' % user_ID)

# if __name__ == '__main__':
#     emit_log(1, {'loss': 0.3}, {'id': '11'})
