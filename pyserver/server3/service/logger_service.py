# -*- coding: UTF-8 -*-
import eventlet

from flask_socketio import SocketIO
# from sio import socketio
from server3.business import staging_data_business
from server3.business import staging_data_set_business


def log_epoch_end(*args):
    print(args)
    save_log('epoch', *args)
    emit_log('epoch', *args)


def log_train_end(*args, **kw):
    save_result(*args, **kw)
    # emit_result(*args)


def save_log_fn(event, n, logs, result_sds, project_id):
    if result_sds is None:
        raise ValueError('no result sds id')

    kw = {'n': n, 'event': event}
    kw.update(logs)
    staging_data_business.add(result_sds, kw)


def emit_log(event, n, logs, result_sds, project_id):
    kw = {'n': n, 'event': event}
    kw.update(logs)
    # add sds id to namespace
    socketio = SocketIO(message_queue='redis://')
    socketio.emit('log_epoch_end', kw, namespace='/log/%s' % project_id)
    # print('send by socket', n, logs)


def save_result_fn(result_sds, **result):
    if result_sds is None:
        raise ValueError('no result sds id passed')
    staging_data_set_business.update(result_sds['id'], **result)


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


def save_log(event, n, logs, result_sds, project_id):
    eventlet.spawn_n(save_log_fn, event, n, logs, result_sds, project_id)


def save_result(result_sds, **result):
    eventlet.spawn_n(save_result_fn, result_sds, **result)


def save_weights_result(result_sds, max_to_keep, key, new_weight):
    eventlet.spawn_n(save_weights_result_fn, result_sds, max_to_keep,
                     key,
                     new_weight)


def emit_result():
    pass

# if __name__ == '__main__':
#     emit_log(1, {'loss': 0.3}, {'id': '11'})
