import logging
import re

from server3.service import logger_service
from server3.utility import str_utility
from server3.repository import config

UPLOAD_FOLDER = config.get_file_prop('UPLOAD_FOLDER')

# regex to match scientific number
sci_re = '-?\d+\.?\d*(?:[Ee]-?\d+)?'
# regex to match float number
float_re = '-?\d+(?:\.\d+)?'


class MetricsHandler(logging.StreamHandler):
    """
    A handler class which use to catch log message for tensorflow
    """
    result_sds = None
    project_id = None

    def emit(self, record):
        msg = self.format(record)
        # compile regex
        # \S maybe match to many cases, alternative \w+/?\w
        re_metrics = re.compile(r'(\S+) = (%s)' % sci_re)
        re_sec = re.compile(r'(%s) sec' % float_re)
        re_step = re.compile(r'\(step (%s)\)' % sci_re)

        # catch metrics and seconds from message
        metrics = re_metrics.findall(msg)
        sec = re_sec.findall(msg)
        step = re_step.findall(msg)

        # construct log object
        log_obj = {metric[0].replace('.', '').split('/')[0]: float(metric[1])
                   for metric in metrics}
        if len(sec) > 0:
            return
        for s in sec:
            log_obj.update({'sec': s})
        for s in step:
            log_obj.update({'step': int(s)})
        if log_obj:
            n = log_obj.pop('step', None)
            n = int(n) if n else n
            # when step n exists, log message
            if n:
                is_val = msg.find('val Monitor')
                is_tra = msg.find('tra Monitor')
                if is_val == 0:
                    log_obj = {'val_' + k: v for k, v in log_obj.items()}
                if is_val == -1 and is_tra == -1:
                    return
                logger_service.log_epoch_end(n, log_obj, self.result_sds,
                                             self.project_id)



# accuracy, precision, recall
