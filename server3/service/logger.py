# -*- coding: UTF-8 -*-
from sio import socketio
from business import staging_data_business


# def log_train_start(step, logs):


def log_epoch_end(*args):
    print(*args)
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
    socketio.emit('log_epoch_end', kw, namespace='/log')#/'+sds_id)
    print('send by socket', n, logs, result_sds)


def save_result():
    pass

# if __name__ == '__main__':
#     emit_log(1, {'loss': 0.3}, {'id': '11'})
