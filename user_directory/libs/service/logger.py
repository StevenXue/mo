# -*- coding: UTF-8 -*-
from flask_socketio import SocketIO
# from sio import socketio
from ..business import staging_data_business


# def log_train_start(step, logs):


def log_epoch_end(*args):
    pass
    save_log(*args, 'epoch')
    emit_log(*args, 'epoch')


def save_log(n, logs, result_sds, event):
    kw = {'n': n, 'event': event}
    kw.update(logs)
    staging_data_business.add(result_sds, kw)


def emit_log(n, logs, result_sds, event):
    kw = {'n': n, 'event': event}
    kw.update(logs)
    sds_id = result_sds['id']
    # add sds id to namespace
    socketio = SocketIO(message_queue='redis://')
    socketio.emit('log_epoch_end', kw, namespace='/log')#/'+sds_id)
    # print('send by socket', n, logs)


def save_result():
    pass

# if __name__ == '__main__':
#     emit_log(1, {'loss': 0.3}, {'id': '11'})
