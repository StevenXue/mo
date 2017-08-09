import logging
import re

from server3.service import logger_service
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
        re_metrics = re. \
            compile(r'(\w+) = (%s)' % sci_re)
        re_sec = re.compile(r'(%s) sec' % float_re)
        # catch metrics and seconds from message
        metrics = re_metrics.findall(msg)
        sec = re_sec.findall(msg)
        # construct log object
        log_obj = {metric[0]: float(metric[1]) for metric in metrics}
        for s in sec:
            log_obj.update({'sec': s})
        if log_obj:
            n = log_obj.pop('step', None)
            # when step n exists, log message
            if n:
                logger_service.log_epoch_end(n, log_obj, self.result_sds,
                                             self.project_id)

# {'n': 601.0, 'event': 'epoch', 'loss': 65.256, 'sec': '0.049'}
# {'n': 18, 'event': 'epoch', 'loss': 59.358048087523386, 'acc': 0.98023715415019763}