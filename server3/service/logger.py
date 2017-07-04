# -*- coding: UTF-8 -*-
from sio import socketio
from business import staging_data_business


# def log_train_start(step, logs):


def log_epoch_end(*args):
    print(*args)
    save_log(*args)
    emit_log(*args)


def save_log(step, logs, result_sds):
    kw = {'step': step}
    kw.update(logs)
    staging_data_business.add(result_sds, kw)


def emit_log(step, logs, result_sds):
    kw = {'step': step}
    kw.update(logs)
    sds_id = result_sds['id']
    print(kw)
    socketio.emit('log_epoch_end', kw, namespace='/log')#/'+sds_id)
    print('send by socket', step, logs, result_sds)

# if __name__ == '__main__':
#     emit_log(1, {'loss': 0.3}, {'id': '11'})
