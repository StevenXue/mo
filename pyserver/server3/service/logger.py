# -*- coding: UTF-8 -*-
from flask_socketio import SocketIO
# from sio import socketio
from server3.business import staging_data_business
from server3.business import staging_data_set_business


# def log_train_start(step, logs):


def log_epoch_end(*args):
    save_log('epoch', *args)
    emit_log('epoch', *args)


def log_train_end(*args, **kw):
    save_result(*args, **kw)
    # emit_result(*args)


def save_log(event, n, logs, result_sds, project_id):
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


def save_result(result_sds, **result):
    if result_sds is None:
        raise ValueError('no result sds id passed')
    staging_data_set_business.update(result_sds, **result)


def emit_result():
    pass
# if __name__ == '__main__':
#     emit_log(1, {'loss': 0.3}, {'id': '11'})
