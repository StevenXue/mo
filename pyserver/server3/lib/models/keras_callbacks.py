# -*- coding: UTF-8 -*-
# Generate dummy data
import warnings

import numpy as np
from keras.callbacks import ModelCheckpoint

from server3.service import logger


class MyModelCheckpoint(ModelCheckpoint):
    def __init__(self, result_sds, monitor='val_loss', verbose=0,
                 save_best_only=False, save_weights_only=False,
                 mode='auto', period=1):
        super(ModelCheckpoint, self).__init__()
        self.monitor = monitor
        self.verbose = verbose
        self.result_sds = result_sds
        self.save_best_only = save_best_only
        self.save_weights_only = save_weights_only
        self.period = period
        self.epochs_since_last_save = 0

        if mode not in ['auto', 'min', 'max']:
            warnings.warn('ModelCheckpoint mode %s is unknown, '
                          'fallback to auto mode.' % (mode),
                          RuntimeWarning)
            mode = 'auto'

        if mode == 'min':
            self.monitor_op = np.less
            self.best = np.Inf
        elif mode == 'max':
            self.monitor_op = np.greater
            self.best = -np.Inf
        else:
            if 'acc' in self.monitor or self.monitor.startswith('fmeasure'):
                self.monitor_op = np.greater
                self.best = -np.Inf
            else:
                self.monitor_op = np.less
                self.best = np.Inf

    def on_epoch_end(self, epoch, logs=None):
        logs = logs or {}
        self.epochs_since_last_save += 1
        if self.epochs_since_last_save >= self.period:
            self.epochs_since_last_save = 0
            # filepath = self.filepath.format(epoch=epoch, **logs)
            if self.save_best_only:
                current = logs.get(self.monitor)
                if current is None:
                    warnings.warn('Can save best model only with %s available, '
                                  'skipping.' % (self.monitor), RuntimeWarning)
                else:
                    if self.monitor_op(current, self.best):
                        if self.verbose > 0:
                            print('Epoch %05d: %s improved from %0.5f to %0.5f,'
                                  ' saving model to staging data set %s'
                                  % (epoch, self.monitor, self.best,
                                     current, self.result_sds))
                        self.best = current
                        weights = self.model.get_weights()
                        logger.save_result(self.result_sds,
                                           best_weights={
                                               'epoch': epoch,
                                               'weights': [weight.tolist() for
                                                           weight in weights]})
                    else:
                        if self.verbose > 0:
                            print('Epoch %05d: %s did not improve' %
                                  (epoch, self.monitor))
            else:
                if self.verbose > 0:
                    print('Epoch %05d: saving model to staging data set %s' % (
                        epoch, self.result_sds))
                weights = self.model.get_weights()
                logger.save_result(self.result_sds,
                                   best_weights={
                                       'epoch': epoch,
                                       'weights': [weight.tolist() for
                                                   weight in weights]})
